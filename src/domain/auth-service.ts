import {WithId} from "mongodb";
import {UserAccountDBType} from "../types/users/inputUsersType";
import {jwtService} from "../application/jwt-service";
import {SessionService} from "./session-service";


class AuthService {
    async loginUser(user: WithId<UserAccountDBType>, ip: string, userAgent: string){
        //создаем токены доступа и обновления
        const accessToken  = await jwtService.createAccessToken(user)
        const refreshToken = await jwtService.createRefreshToken(user)

        //декодируем и проверяем токен
        const decoded = await jwtService.getPayload(refreshToken)

        //создаю сессию для пользователя
        const lastActiveDate = new Date(decoded.iat!*1000)
        const deviceId = decoded.deviceId

        const title = userAgent || 'UNKNOWN'

        await SessionService.createSession({ip, title, lastActiveDate, deviceId, userId:user._id.toString()})

        return { accessToken,  refreshToken}
    }

    async refreshToken(user:WithId<UserAccountDBType>, oldRefreshToken: string, deviceId:string){
        //создаем новые токены доступа и оббновления
        const newAccessToken = await jwtService.createAccessToken(user)
        const newRefreshToken = await jwtService.createRefreshTokenWithDeveceID(user, deviceId)

        //декодирование и пооверка токена

        const decoded = await jwtService.getPayload(newRefreshToken)
        const lastActiveDate = new Date(decoded.iat!*1000)

        //обновляю дату lastactivedate в сессии
        await SessionService.updateSession({lastActiveDate, deviceId})
            return  {newAccessToken, newRefreshToken}

    }
}

export const authService = new AuthService();