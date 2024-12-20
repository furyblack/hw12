import {LikeStatusEnum} from "../../db/likes-model";

export type CommentOutputType = {
    "id": string,
    "content": string,
    "commentatorInfo": {
        "userId": string,
        "userLogin": string
    },
    "createdAt": string
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus:LikeStatusEnum
    }
}



