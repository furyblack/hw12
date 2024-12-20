import {CreateNewBlogType} from "./input";

export type BlogOutputType =  {
    "id": string,
    "name": string,
    "description": string,
    "websiteUrl": string,
    "isMembership": boolean,
    "createdAt": string
}



export type blogSortData = {
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: string | null,
}

export type PaginationOutputType<I> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount:  number,
    items: I
}