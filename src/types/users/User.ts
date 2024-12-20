import {CreateNewUserType, UserAccountDBType} from "./inputUsersType";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import bcrypt from "bcrypt";



type createInput = {
    login : string,
    email: string,
    password: string,
    confirmationCode: string | null,
    expirationDate: Date | null,
    createdAt: Date,
    isConfirmed : boolean
}
export class UserFactory {
    private static async _generateHash(password: string, salt: string){
        return await bcrypt.hash(password, salt)
    }
    private static async create(input : createInput): Promise<UserAccountDBType> {
        const {
            login,
            email,
            password,
            confirmationCode,
            expirationDate,
            isConfirmed,
            createdAt
        } = input
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)
        return {

            accountData: {
                userName: login,
                email,
                passwordHash,
                passwordSalt,
                createdAt
            },
            emailConfirmation: {
                confirmationCode,
                expirationDate,
                isConfirmed
            },
            recoveryCode: {
            code:'',
            expirationDate: new Date()}
        }

    }

    public static async createConfirmedUser({login, password, email} : CreateNewUserType) {
        return this.create({
            login, email,password,
            createdAt: new Date(),
            isConfirmed: true,
            confirmationCode: null,
            expirationDate: null
        })
    }
    public static async createUnconfirmedUser({login, password, email} : CreateNewUserType) {
        return this.create({
            login,
            email,
            password,
            createdAt: new Date(),
            isConfirmed: false,
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(),{
                    minutes:30
                })
        })
    }
}
