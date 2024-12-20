import * as dotenv from "dotenv";
//пытаюсь подключить бд
import mongoose from "mongoose";

dotenv.config()
const mongoUri = process.env.MONGO_URL as string // вытащили из енви строку  подключения
const dbName =  process.env.DB_NAME

export async  function connectMongo (){
    try{
        await mongoose.connect(mongoUri, {dbName})
        console.log('hello')
        return true
    }catch (e) {
        console.log(e)
        await mongoose.disconnect()
        return false
    }
}
