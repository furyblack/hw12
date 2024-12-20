import bcrypt from 'bcrypt';
import {UsersRepository} from "../repositories/users-repository";
import {WithId} from "mongodb";
import {UserFactory} from "../types/users/User";
import {UserAccountDBType} from "../types/users/inputUsersType";
import {nodemailerService} from "./nodemailer-service";
import {v4 as uuidv4} from "uuid";
import {add} from 'date-fns';


export class UsersService {
    constructor(protected userRepo: UsersRepository) {}
    async createUser(login: string, email: string, password: string): Promise<string> {

        const newUser = await UserFactory
            .createConfirmedUser({login, password, email})
        return await this.userRepo.createUser(newUser)
    }

    async createUnconfirmedUser(login: string, email: string, password: string): Promise<boolean | null> {
        const newUser = await UserFactory.createUnconfirmedUser({login, password, email});
        try {
            nodemailerService.sendEmail(
                newUser.accountData.email,
                "Registration confirmation",
                `To finish registration please follow the link below:\nhttps://some-front.com/confirm-registration?code=${newUser.emailConfirmation.confirmationCode}`)
        } catch (e) {
            console.log(e)
            return null
        }
        await this.userRepo.createUser(newUser);
        return true
    }

    async confirmEmail(code: string): Promise<boolean> {
        let user = await this.userRepo.findUserByConfirmationCode(code);
        if (!user || !user.emailConfirmation.expirationDate) return false

        if (user.emailConfirmation.confirmationCode === code && user.emailConfirmation.expirationDate > new Date()) {
            return await this.userRepo.updateConfirmation(user._id);
        }
        return false;
    }

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

    async checkCredentials(loginOrEmail: string, password: string) {

        const user: WithId<UserAccountDBType> | null = await this.userRepo.findByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)

        if (user.accountData.passwordHash !== passwordHash) {
            return null
        }
        return user
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.userRepo.deleteUser(id)
    }

    async findUserByEmail(email: string) {
        return await this.userRepo.findByEmail(email);
    }

    async resendConfirmationEmail(email: string): Promise<void> {
        const user = await this.findUserByEmail(email);

        const newCode = uuidv4();
        const newExpirationDate = add(new Date(), {minutes: 30});

        await this.userRepo.updateConfirmationCode(user!._id, newCode, newExpirationDate);

        nodemailerService.sendEmail(
            user!.accountData.email,
            "Registration confirmation",
            `To finish registration please follow the link below:\nhttps://some-front.com/confirm-registration?code=${newCode}`
        );
    }



    //Восстановление пароля при помощи отправки письма
    async initiatePasswordRecovery(email: string): Promise<boolean> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return true;
        }

        const recoveryCode = uuidv4();
        const expirationDate = add(new Date(), {hours: 1});

        await this.userRepo.updateRecoveryCode(user._id, recoveryCode, expirationDate);

        try {
            await nodemailerService.sendEmail(
                email,
                "Password Recovery",
                recoveryCode
            );
        } catch (e) {
            console.log(e);
            return false;
        }

        return true;
    }

    async confirmPasswordRecovery(newPassword: string, recoveryCode: string): Promise<boolean> {
        const user = await this.userRepo.findUserByRecoveryCode(recoveryCode);
        if (!user || user.recoveryCode.expirationDate < new Date()) return false;

        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, passwordSalt);

        await this.userRepo.updatePassword(user._id, passwordHash, passwordSalt);
        await this.userRepo.clearRecoveryCode(user._id);

        return true;
    }
}
