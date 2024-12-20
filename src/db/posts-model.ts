import mongoose from "mongoose";
import {PostCreateType, PostMongoDbType} from "../types/posts/output";
import {ObjectId} from "mongodb";


//СХЕМА И МОДЕЛЬ ПОСТОВ
export const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true},
})
export const PostModel = mongoose.model<PostMongoDbType>('posts', postSchema)


export class PostDb{
    public _id: ObjectId
    public  title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: Date

    constructor(data:PostCreateType) {
        this._id = data._id
        this.title = data.title
        this.shortDescription = data.shortDescription
        this.content = data.content
        this.blogId = data.blogId
        this.blogName = data.blogName
        this.createdAt = new Date()
    }
}