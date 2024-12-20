import mongoose from "mongoose";
import {SessionType} from "../types/session/sessionType";


//СХЕМА И МОДЕЛЬ СЕССИЙ
export const sessionSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    title: {type: String, required: true},
    lastActiveDate: {type: Date, required: true},
    deviceId: {type: String, required: true},
    userId: {type: String, required: true}
})
export const SessionModel = mongoose.model<SessionType>('sessions', sessionSchema)

