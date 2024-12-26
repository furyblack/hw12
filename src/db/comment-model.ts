import mongoose from "mongoose";
import {CreateCommentServiceType} from "../domain/comment-service";



//СХЕМА И МОДЕЛЬ КОММЕНТОВ
export const commentSchema = new mongoose.Schema({
    postId:{type: String, required: true},
    content: {type: String, required: true},
    commentatorInfo:{
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    createdAt: {type: Date, required: true},
    likesInfo:{
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true},
    }
})
export const CommentModel = mongoose.model<CommentMongoDbType>('comments', commentSchema)


export class CommentMongoDbType {
    constructor(
        public postId: string,
        public content: string,
        public commentatorInfo: {
            userId: string,
            userLogin: string,
        },
        public createdAt: Date,
        public likesInfo: {
            likesCount: number,
            dislikesCount: number
        }
    ) {
    }
}

export class CommentDb {
    public postId: string
    public content: string
    public commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    public createdAt: Date
    public likesInfo: {
        likesCount: number,
        dislikesCount: number
    }
    constructor(data: CreateCommentServiceType) {
        this.postId = data.postId
        this.content = data.content
        this.commentatorInfo =  {
            userId: data.userId,
            userLogin: data.userLogin
        }
        this.createdAt = new Date()
        this.likesInfo = {
            likesCount: 0,
            dislikesCount: 0
        }
    }
}