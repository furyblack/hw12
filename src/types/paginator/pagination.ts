import {blogQuerySortData} from "../blogs/input";
import {blogSortData} from "../blogs/output";
import {userQuerySortData} from "../users/inputUsersType";
import {userSortData} from "../users/outputUserType";

export function paginator(query: blogQuerySortData):blogSortData {
    const pageSize = query.pageSize ? +query.pageSize : 10
    const pageNumber = query.pageNumber ? +query.pageNumber: 1
    const sortBy = query.sortBy ? query.sortBy as string: 'createdAt'
    const sortDirection = query.sortDirection ? query.sortDirection  : 'desc'
    const searchNameTerm = query.searchNameTerm ? query.searchNameTerm as string: null
    return  {
        pageSize,pageNumber,sortBy,sortDirection, searchNameTerm
    }
}

export function userPaginator(query: userQuerySortData):userSortData {
    const pageSize = query.pageSize ? +query.pageSize : 10
    const pageNumber = query.pageNumber ? +query.pageNumber: 1
    const sortBy = query.sortBy ? query.sortBy as string: 'createdAt'
    const sortDirection = query.sortDirection ? query.sortDirection  : 'desc'
    const searchLoginTerm = query.searchLoginTerm ? query.searchLoginTerm as string: null
    const searchEmailTerm = query.searchEmailTerm ? query.searchEmailTerm as string: null
    return  {
        pageSize,pageNumber,sortBy,sortDirection, searchLoginTerm, searchEmailTerm
    }
}