import { NextFunction, Response, Request } from 'express';
import { jwtService } from "../../application/jwt-service";
import { body } from "express-validator";
import { inputValidationMiddleware } from "../inputValidation/input-validation-middleware";
import {SessionService} from "../../domain/session-service";
import {UserModel} from "../../db/user-model";
import {RequestCountModel} from "../../db/requestcount-model";
import {UsersRepository} from "../../repositories/users-repository";


const userRepo = new UsersRepository()

// Middleware для базовой аутентификации
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Проверяем наличие и правильность заголовка авторизации
    if (req.headers['authorization'] !== 'Basic YWRtaW46cXdlcnR5') {
        res.sendStatus(401); // Если заголовок неправильный, возвращаем 401 (Unauthorized)
        return;
    }
    return next(); // Если все в порядке, передаем управление следующему middleware
}

// Middleware для аутентификации с использованием Bearer токена
export const authMiddlewareBearer = async (req: Request, res: Response, next: NextFunction) => {
    // Проверяем наличие заголовка авторизации
    if (!req.headers.authorization) {
        res.sendStatus(401); // Если заголовок отсутствует, возвращаем 401 (Unauthorized)
        return;
    }
    // Извлекаем токен из заголовка
    const token = req.headers.authorization.split(' ')[1];
    // Получаем ID пользователя по токену
    const userId = await jwtService.getUserIdByToken(token);
    // Ищем пользователя в базе данных
    const user = await userRepo.findUserById(userId);
    if (user) {
        req.userDto = user; // Добавляем пользователя в объект запроса
        next(); // Передаем управление следующему middleware
        return;
    }
    res.sendStatus(401); // Если пользователь не найден, возвращаем 401 (Unauthorized)
}

// Валидатор для уникального email
export const uniqEmailValidator = body("email")
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Email is not valid')
    .custom(async (email) => {
        // Проверяем наличие пользователя с таким email в базе данных
        const existingUser = await UserModel.findOne({ 'accountData.email': email });
        if (existingUser) {
            throw new Error("пользователь с таким email существует");
        }
        return true;
    });

export const emailValidator = body("email")
    .isEmail()
    .withMessage('Email is not valid');

//проверка на уникальность осуществлять в сервиссах,

// Валидатор для пароля
export const passwordValidator = body('password')
    .isString().withMessage('Password must be a string')
    .trim().isLength({ min: 6, max: 20 }).withMessage('Incorrect password');

// Валидатор для уникального логина
export const uniqLoginValidator = body("login")
    .isString()
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login is not valid')
    .isLength({ min: 3, max: 10 })
    .custom(async (login) => {
        // Проверяем наличие пользователя с таким логином в базе данных
        const existingUser = await UserModel.findOne({ 'accountData.userName': login });
        if (existingUser) {
            throw new Error("пользователь с таким login существует");
        }
        return true;
    });

// Валидатор для подтверждения пользователя по email
export const userConfirmedValidator = body("email")
    .isString()
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Email is not Valid')
    .custom(async (email) => {
        // Ищем пользователя в базе данных по email
        const user = await UserModel.findOne({ 'accountData.email': email });

        if (!user) {
            throw new Error("пользователя нет");
        }
        // Проверяем, подтвержден ли пользователь
        if (user.emailConfirmation.isConfirmed) {
            throw new Error("пользователь уже подтвержден");
        }
        return true;
    });

// Middleware для аутентификации с использованием refresh токена
export const authMiddlewareRefresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;


    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }

    try {
        // Получаем ID пользователя по refresh токену
        const payload = await jwtService.getUserIdByRefreshToken(refreshToken);
        if(!payload){
            res.sendStatus(401); // Если пользователь не найден, возвращаем 401 (Unauthorized)
            return;
        }
        const lastActiveDate  = new Date(payload.iat! * 1000);// доставать не только юзер ай ди но и девайс айди и iat

        // Ищем пользователя в базе данных
        const user = await userRepo.findUserById(payload.userId);
        //найти сессию и проверить что ласт эктив дейт  = iat
        const session = await SessionService.findSessionByDeviceId(payload.deviceId)


        if (user && session && session.lastActiveDate.toISOString() === lastActiveDate.toISOString()) {
            req.userDto = user; // Добавляем пользователя в объект запроса
            console.log(req.userDto)
            req.deviceId = payload.deviceId
            return  next()
        } else {
            res.status(401).send({ message: "Сессия не найдена или lastActiveDate не совпадает с iat" });
        }

    } catch (error) {
        res.sendStatus(401); // Если токен протух или неверный, возвращаем 401 (Unauthorized)
    }
};

// middleware для RATE LIMIT
const REQUEST_LIMIT = 5; //количество доступных запросов
const TIME_WINDOW = 10*1000; // 10 сек, время за которое считаю запросы
export const rateLimiterMiddlewave = async (req:Request, res: Response, next: NextFunction) => {
    const ip = req.ip!.toString()
    const url = req.originalUrl
    const currentTime = new Date()
    try {
        //записываем текущий request в коллекцию( теперь уже в модель)
        await RequestCountModel.create({
            ip,
            url,
            date: currentTime
        })
        //вычисляем время начала окна
        const windowStartTime = new Date(currentTime.getTime()-TIME_WINDOW)

        //считаем количество запросов за временное окно
        const requestCount = await RequestCountModel.countDocuments({
            ip,
            url,
            date: { $gte: windowStartTime}
        })

        //проверяем превышает ли количество requestov указанный лимит
        if(requestCount > REQUEST_LIMIT){
            return res.status(429).send('too many requests')
        }else{
            return next()
        }
    }catch (error){
        console.error('error rate limit', error)
        res.status(500).send('server error')
    }
}


export const passwordRecoveryValidation = () => {
    return [
        body('newPassword').isString().isLength({ min: 6, max: 20 }).withMessage('Password length should be between 6 and 20 characters'),
        body('recoveryCode').isString().withMessage('Recovery code must be a string')
    ];
}


// Функция для валидации при регистрации
export const registrationValidation = () => [
    uniqEmailValidator,
    passwordValidator,
    uniqLoginValidator,
    inputValidationMiddleware
];

// Функция для валидации при повторной отправке письма с подтверждением
export const emailResendingValidation = () => [
    userConfirmedValidator,
    inputValidationMiddleware
];
