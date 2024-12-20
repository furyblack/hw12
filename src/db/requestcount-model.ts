
//СХЕМА И МОДЕЛЬ ДЛЯ REQUEST COUNT
import mongoose from "mongoose";
import {requestCountType} from "../types/session/sessionType";

export const RequestCountSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    url: {type: String, required: true},
    date: {type: Date, required: true}
})
export const RequestCountModel = mongoose.model<requestCountType>('requestsCount', RequestCountSchema)
