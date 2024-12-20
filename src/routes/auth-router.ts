import { Response, Request, Router } from "express";
import { RequestWithBody } from "../types/common";
import { LoginUserType, UserAccountDBType } from "../types/users/inputUsersType";
import { jwtService } from "../application/jwt-service";
import { WithId } from "mongodb";
import { CurrentUserType } from "../types/users/outputUserType";
import {
    authMiddlewareBearer, authMiddlewareRefresh,
    emailResendingValidation, emailValidator, passwordRecoveryValidation, rateLimiterMiddlewave,
    registrationValidation,
} from "../middlewares/auth/auth-middleware";
import { loginzationValidation } from "../validators/user-validators";
import {SessionService} from "../domain/session-service";
import {inputValidationMiddleware} from "../middlewares/inputValidation/input-validation-middleware";
import {authService} from "../domain/auth-service";
import {userService} from "../composition-root";


export const authRouter = Router({});


// Endpoint для входа пользователя
authRouter.post('/login', loginzationValidation(), rateLimiterMiddlewave, async (req: RequestWithBody<LoginUserType>, res: Response) => {

    // Проверяем учетные данные пользователя
    const user: WithId<UserAccountDBType> | null = await userService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if (!user) {
        res.sendStatus(401); // Если пользователь не найден, возвращаем 401 (Unauthorized)
        return;
    }
     const { accessToken, refreshToken} = await authService.loginUser(user, req.ip!, req.headers['user-agent'] as string)

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken });

});

// Endpoint для обновления токена
authRouter.post('/refresh-token', authMiddlewareRefresh, async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies?.refreshToken;
    const user = req.userDto as WithId<UserAccountDBType>;

    if (!oldRefreshToken || !user) {
        res.sendStatus(401); // Если токен отсутствует или пользователь не найден, возвращаем 401
        return;
    }
    const { newAccessToken, newRefreshToken } = await authService.refreshToken(user, oldRefreshToken, req.deviceId);

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken: newAccessToken });

});

// Endpoint для выхода пользователя
authRouter.post('/logout', authMiddlewareRefresh, async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        res.sendStatus(401); // Если токен отсутствует, возвращаем 401
        return;
    } // удалить сессию -> 204
    // Дотсаем deviceId из пейлода
    const decoded =  await jwtService.getPayload(refreshToken)
    // const deviceId = decoded.deviceId;

    // Удаляем сессию по deviceId
    await SessionService.deleteSessionByDeviceId(decoded.deviceId);
    res.clearCookie('refreshToken');
    res.sendStatus(204)
});

// Endpoint для получения информации о текущем пользователе
authRouter.get('/me', authMiddlewareBearer, async (req: Request, res: Response<CurrentUserType>) => {
    const user = req.userDto;
    return res.status(200).json({
        "login": user.accountData.userName,
        "email": user.accountData.email,
        "userId": user._id.toString()
    });
});

// Endpoint для регистрации нового пользователя
authRouter.post('/registration', rateLimiterMiddlewave, registrationValidation(),  async (req: Request, res: Response) => {
    // Создаем нового неподтвержденного пользователя
    const result = await userService.createUnconfirmedUser(req.body.login, req.body.email, req.body.password);
    if (!result) {
        res.sendStatus(500); // Если произошла ошибка, возвращаем 500 (Internal Server Error)
        return;
    }
    res.sendStatus(204); // No Content
});

// Endpoint для подтверждения регистрации по коду
authRouter.post('/registration-confirmation', rateLimiterMiddlewave, async (req: Request, res: Response) => {
    const result = await userService.confirmEmail(req.body.code);
    if (!result) {
        res.status(400).send({ errorsMessages: [{ message: 'пользователь уже подтвержден', field: "code" }] });
        return;
    }
    res.sendStatus(204); // No Content
});

// Endpoint для повторной отправки письма с подтверждением
authRouter.post('/registration-email-resending', rateLimiterMiddlewave, emailResendingValidation(),  async (req: Request, res: Response) => {
    const email = req.body.email;
    await userService.resendConfirmationEmail(email);
    res.sendStatus(204); // No Content
});

authRouter.post('/password-recovery', rateLimiterMiddlewave, emailValidator, inputValidationMiddleware, async (req: Request, res: Response) =>{
    const { email } = req.body;
    const result = await userService.initiatePasswordRecovery(email);
    if (!result) {
        res.status(400).send({ errorsMessages: [{ message: 'Invalid email', field: "email" }] });
        return;
    }
    res.sendStatus(204); // No Content
})

authRouter.post('/new-password', rateLimiterMiddlewave, passwordRecoveryValidation(), inputValidationMiddleware, async (req: RequestWithBody<{
    newPassword: string, recoveryCode: string
}>, res: Response)=>{
    const { newPassword, recoveryCode } = req.body;
    const result = await userService.confirmPasswordRecovery(newPassword, recoveryCode)

    if(!result){
        res.status(400).send({errorsMessages: [{message:'invalid recovery code or recovery code has expired', field:'recoveryCode'}]})
        return
    }
    res.sendStatus(204)
})
