import {WithId} from "mongodb";
import jwt from 'jsonwebtoken';
import {UserAccountDBType} from "../types/users/inputUsersType";
import {randomUUID} from "node:crypto";
import {JwtPayload} from "../types/session/sessionType";
import * as crypto from "crypto";

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret';
export const refreshTokenExpiration = 6000;  // Время жизни refresh токена

export const jwtService={

    async  createAccessToken(user:WithId<UserAccountDBType>){

        return jwt.sign({userId: user._id, noise:crypto.randomUUID()}, process.env.JWT_SECRET as string, {expiresIn: '1000s'})
    },
    async createRefreshToken(user: WithId<UserAccountDBType>) {
        const deviceId = randomUUID()
        return jwt.sign({ userId: user._id, deviceId, noise:crypto.randomUUID() }, refreshTokenSecret, { expiresIn: `${refreshTokenExpiration}s` });
    },
    async createRefreshTokenWithDeveceID(user: WithId<UserAccountDBType >, deviceId:string) {
        // await new Promise(resolve => setTimeout(resolve, 100));
        return jwt.sign({ userId: user._id, deviceId, noise:crypto.randomUUID() }, refreshTokenSecret, { expiresIn: `${refreshTokenExpiration}s` });
    },


    async getPayload (token: string){
        return  jwt.decode(token) as jwt.JwtPayload;
    },

    async getUserIdByToken(token:string){
        try {
            const result: any = jwt.verify(token, process.env.JWT_SECRET as string)
            return  result.userId
        }catch (error){
            return null
        }
    },

    async getUserIdByRefreshToken(token: string) {
        try {
            return jwt.verify(token, refreshTokenSecret) as JwtPayload
        } catch (error) {
            return null;
        }
    },
}