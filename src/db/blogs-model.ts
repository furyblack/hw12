import mongoose from "mongoose";
import {CreateNewBlogType} from "../types/blogs/input";


//СХЕМА И МОДЕЛЬ БЛОГОВ
const blogSchema  = new mongoose.Schema ({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const BlogModel = mongoose.model<BlogDb>('blogs', blogSchema)


export  class BlogDb {
    public name: string
    public description: string
    public websiteUrl: string
    public createdAt: Date

    constructor(data:CreateNewBlogType) {
        this.name = data.name
        this.description = data.description
        this.websiteUrl = data.websiteUrl
        this.createdAt = new Date()

    }
}