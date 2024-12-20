export type CurrentUserType = {
    "login": string,
    "email": string,
    "userId": string

}

export type UserOutputType = {
    "id": string,
    "login": string,
    "email": string,
    "createdAt": string
}

export type userSortData = {
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
}


