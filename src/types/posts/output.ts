import {ObjectId} from "mongodb";
import {LikeStatusEnum} from "../../db/likes-model";

export type PostOutputType = {
    "id": string,
    "title": string,
    "shortDescription": string,
    "content": string,
    "blogId": string,
    "blogName": string,
    "createdAt": string,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus:LikeStatusEnum,
        newestLikes:Omit<newestLikesType,"_id">[]
    }
}
export type newestLikesType ={
    "_id":ObjectId,
    "addedAt": string,
    "userId": string,
    "login": string,
}

export type PostMongoDbType =  {
    "_id": ObjectId,
    "title": string,
    "shortDescription": string,
    "content": string,
    "blogId": string,
    "blogName": string,
    "createdAt": Date,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        newestLikes: newestLikesType[]
    }
}
export type PostCreateType =  {
    "_id": ObjectId,
    "title": string,
    "shortDescription": string,
    "content": string,
    "blogId": string,
    "blogName": string,
}

export type postSortData = {
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: string | null,
}