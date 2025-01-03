import {UserAccountDBType} from "../types/users/inputUsersType";
import {ObjectId, WithId} from "mongodb";
import {UserModel} from "../db/user-model";
import {injectable} from "inversify";
@injectable()
export class UsersRepository{

     async createUser(user: UserAccountDBType): Promise<string> {
        const newUserToDb = new UserModel(user)
        await newUserToDb.save()
        return newUserToDb._id.toString()
    }

     async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserAccountDBType> | null> {
        return UserModel.findOne({ $or: [{ "accountData.email": loginOrEmail }, { "accountData.userName": loginOrEmail }] });
    }
     async findUserByConfirmationCode(emailConfirmationCode: string) {
        return UserModel.findOne({ "emailConfirmation.confirmationCode": emailConfirmationCode });
    }

     async deleteUser(id: string): Promise<boolean> {
        try {
            const result = await UserModel.findByIdAndDelete(id)
            if(result) return true
            return false
        } catch (error) {
            console.error("Error deleting user", error);
            return false;
        }
    }

     async findUserById(id: string): Promise<WithId<UserAccountDBType> | null> {
        try {
            return UserModel.findById(id)
        } catch (error) {
            console.error("Error deleting user", error);
            return null;
        }
    }

     async findByEmail(email: string): Promise<WithId<UserAccountDBType> | null> {
        return  UserModel.findOne({ "accountData.email": email });
    }

     async updateConfirmation(_id: ObjectId) {
        let result = await UserModel.findOneAndUpdate({_id:_id},{"emailConfirmation.isConfirmed": true});
        if(result) return true
        return false
    }
     async updateConfirmationCode(userId: ObjectId, newCode: string, newExpirationDate: Date) {
        await UserModel.findOneAndUpdate(
            { _id: userId },
             {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': newExpirationDate
                }
        );
    }
     async updateRecoveryCode(userId: ObjectId, recoveryCode: string, expirationDate: Date): Promise<void> {
        await UserModel.findByIdAndUpdate(
            userId,
            {
                "recoveryCode.code": recoveryCode,
                "recoveryCode.expirationDate": expirationDate
            }
        );
    }

     async findUserByRecoveryCode(recoveryCode: string): Promise<WithId<UserAccountDBType> | null> {
        return UserModel.findOne({ "recoveryCode.code": recoveryCode });
    }

     async updatePassword(userId: ObjectId, passwordHash: string, passwordSalt: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            "accountData.passwordHash": passwordHash,
            "accountData.passwordSalt": passwordSalt
        });
    }

     async clearRecoveryCode(userId: ObjectId): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            "recoveryCode.code": null,
            "recoveryCode.expirationDate": null
        });
    }
}
