
export type CreateNewUserType= {
    "login": string,
    "password": string,
    "email": string
}


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

