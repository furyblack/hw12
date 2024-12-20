import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {queryBlogRepo} from "../repositories/query-blog-repository";
import {PostDb} from "../db/posts-model";
import {ObjectId} from "mongodb";
import {queryPostRepo} from "../repositories/query-post-repository";
import {PostRepository} from "../repositories/post-repository";

export class PostMapper{
    static toDto(post:PostMongoDbType):PostOutputType{
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString()
        }
    }
}
export class PostService{
    constructor(protected postRepo:PostRepository) {
    }

     async createPost(postParams: CreateNewPostType): Promise<PostOutputType | null>{
        const targetBlog = await queryBlogRepo.getById(postParams.blogId)
        if (!targetBlog){
            return null
        }
        const  newPost = new PostDb({
            _id: new ObjectId(),
            title: postParams.title,
            shortDescription: postParams.shortDescription,
            content: postParams.content,
            blogId: postParams.blogId,
            blogName: targetBlog.name,
        })

         return this.postRepo.createPost(newPost)

    }

     async  updatePost(postId: string,  updateData:UpdatePostType): Promise<boolean | null>{
        const post = await queryPostRepo.getById(postId)
        if(!post){
            return null
        }
        return this.postRepo.updatePost(postId,updateData)

    }
    async deletePost(id: string): Promise<boolean> {
        try {
            const result = await this.postRepo.deletePost(id);
            return result; // Возвращаем результат из репозитория
        } catch (error) {
            console.error("Error deleting post", error);
            return false; // Возвращаем false в случае ошибки
        }
    }

}


