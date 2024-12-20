import mongoose from "mongoose";


//СХЕМА И МОДЕЛЬ ДЛЯ ЛАЙКОВ И ДИЗЛАЙКОВ НА КОМЕНТЫ

export enum LikeStatusEnum {
    LIKE='Like', DISLIKE='Dislike', NONE='None'
}
export const likeSchema  = new mongoose.Schema({
    commentId: {type: mongoose.Schema.Types.ObjectId, ref:'comments', required:true},
    userId: {type:String, required:true},
    status:{type:String, enum: LikeStatusEnum, required:true},
    createdAt:{type:Date, required:true}
})

export type likeType = {
    commentId: mongoose.Schema.Types.ObjectId,
    userId: String,
    status:LikeStatusEnum,
    createdAt:Date
}
export const LikeModel  = mongoose.model<likeType>('CommentsLikes', likeSchema )
