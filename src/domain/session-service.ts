import {SessionType, UpdateSessionType} from "../types/session/sessionType";
import {SessionRepository} from "../repositories/session-repository";
import {SessionModel} from "../db/session-model";

export class SessionService {

    static async createSession(data: SessionType ) {
        const {ip, title, lastActiveDate, deviceId,userId} = data
        await SessionRepository.createSession({
            ip,
            title,
            lastActiveDate,
            deviceId,
            userId
        });

    }
    static async findSessionByDeviceId(deviceId: string): Promise<SessionType | null> {
        return await SessionRepository.findSessionByDeviceId(deviceId);
    }

    static async deleteSessionByDeviceId(deviceId: string): Promise<void>{
        await SessionModel.deleteOne({deviceId})  // а должна ли тут быть модель или коллекция? остальные модули в репу стучатся
    }

    static async updateSession(data: UpdateSessionType): Promise<void> {
        const {lastActiveDate, deviceId} = data;

        // ищу существующую сессию по deviceId
        const currentSession = await SessionRepository.findSessionByDeviceId(deviceId);
        if (!currentSession) {
            throw new Error('Session not found');
        }
        // обновляю поля сессии
        currentSession.lastActiveDate = lastActiveDate;
        // сохраняем обновления в бд
        await SessionRepository.updateSession(currentSession);
    }
}