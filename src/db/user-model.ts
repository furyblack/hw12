import mongoose from "mongoose";
import {UserAccountDBType} from "../types/users/inputUsersType";


//СХЕМА И МОДЕЛЬ ЮЗЕРОВ
export const userSchema = new mongoose.Schema({
    accountData: {
        userName:  {type: String, required: true},
        email:  {type: String, required: true},
        passwordHash:  {type: String, required: true},
        passwordSalt:{type: String, required: true},
        createdAt: {type: Date, required: true}
    },
    emailConfirmation: {
        confirmationCode:  {type: String},
        expirationDate:  {type: Date},
        isConfirmed:  {type: Boolean},
    },
    recoveryCode:{
        code:{type:String, default:''},
        expirationDate:{type:Date, default:null}
    }
})
export const UserModel = mongoose.model<UserAccountDBType>('users', userSchema)
