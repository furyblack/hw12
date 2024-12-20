import {SessionModel} from "../db/session-model";


export class QuerySessionRepository {
    static async getActiveDevises(userId:string, liveTime: number){
        const now = new Date()
        const newTime = new Date(now.getTime()-liveTime*1000)
        try {
            const sessions = await SessionModel.find({
                userId:userId,
                lastActiveDate:{ $gt: newTime}
            }).lean()
            //мапим данные сессии для требуемого формата на клиент
            const formatedSessions = sessions.map(session=>({
                ip:session.ip,
                title: session.title,
                lastActiveDate:session.lastActiveDate.toISOString(),
                deviceId:session.deviceId
            }))
            return formatedSessions
        }catch (error){
            console.error('Error fetching active devices', error)
            throw new Error('database query failed')
        }
    }

    static async terminateOtherSessions(userId:string, currentDeviceId:string){
        try {
            const result = await SessionModel.deleteMany({
                userId:userId,
                deviceId:{ $ne:currentDeviceId }
            });
            return result.deletedCount>0
        }catch (error){
            console.error('error terminating other sessions', error)
            throw new Error('database query failed')
        }
    }
    static async terminateSpecificSession(userId:string, deviceIdToDelete:string){
        try {
            const result = await SessionModel.deleteOne({
                userId:userId,
                deviceId:deviceIdToDelete
            })
            return result.deletedCount>0

        }catch (error){
            console.error('error terminate specific session', error)
            throw new Error('database query failed')
        }
    }
    static async findSessionByIdAndUser(deviceId:string){
        try {
            return await SessionModel.findOne({deviceId:deviceId})
        }catch (error){
            console.error('error finding session',  error)
            throw new Error('database query failed')
        }
    }
}