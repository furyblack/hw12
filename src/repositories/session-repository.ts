import {SessionType} from "../types/session/sessionType";
import {SessionModel} from "../db/session-model";



export class SessionRepository{
    static async createSession(session:SessionType ){
        await SessionModel.create(session)
    }
    static async findSessionByDeviceId(deviceId: string): Promise<SessionType | null> {
        return await SessionModel.findOne({ deviceId });//findOne({ deviceId });
    }
    static async updateSession(session: SessionType): Promise<void> {
        await SessionModel.updateOne(
            { deviceId: session.deviceId },
            { $set: {  lastActiveDate: session.lastActiveDate } }
        );
    }
    static async deleteSessionByDeviceId(deviceId: string): Promise<void> {
        await SessionModel.findByIdAndDelete(deviceId);// было deleteOne({ deviceId });
    }
}