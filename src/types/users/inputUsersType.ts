
export type CreateNewUserType= {
    "login": string,
    "password": string,
    "email": string
}

// export class UserAccountDBType{
//     public userAccountType:{
//         public email: string,
//         public userName: string,
//         public passwordHash: string,
//         public passwordSalt: string,
//         public createdAt: Date
//     }
//     public EmailConfirmationType:{
//        public isConfirmed : boolean
//        public confirmationCode : string | null
//        public expirationDate : Date | null
//     }
//     public RecoveryCode:{
//         public code:string
//         public expirationDate: Date
//     }
// }

export type UserAccountDBType ={
    accountData: UserAccountType,
    emailConfirmation: EmailConfirmationType,
    recoveryCode: RecoveryCode
}
export type UserAccountType= {
    "email": string,
    "userName": string,
    "passwordHash": string,
    "passwordSalt": string,
    "createdAt": Date
}
export type EmailConfirmationType= {
    "isConfirmed": boolean,
    "confirmationCode": string | null,
    "expirationDate": Date | null
}
export type RecoveryCode = {
        code:string,
        expirationDate: Date
}

export type LoginUserType= {
    "loginOrEmail": string,
    "password": string,
}

export type userQuerySortData = {
    pageSize?: number,
    pageNumber?: number,
    sortBy?: string,
    sortDirection?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
}

