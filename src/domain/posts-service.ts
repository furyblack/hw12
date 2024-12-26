import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {queryBlogRepo} from "../repositories/query-blog-repository";
import {PostDb, PostModel} from "../db/posts-model";
import {ObjectId} from "mongodb";
import {queryPostRepo} from "../repositories/query-post-repository";
import {PostRepository} from "../repositories/post-repository";
import {LikeModelPosts, LikeStatusEnum} from "../db/likes-model";

export class PostMapper{
    static toDto(post:PostMongoDbType, likeStatus:LikeStatusEnum=LikeStatusEnum.NONE):PostOutputType{
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo:{
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: likeStatus,
                newestLikes:[]
            }

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

    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatusEnum): Promise<void> {
        const existingLike = await LikeModelPosts.findOne({ postId, userId });

        if (likeStatus === LikeStatusEnum.NONE) {
            if (existingLike) {
                await existingLike.deleteOne();
            }
        } else {
            if (existingLike) {
                if (existingLike.status !== likeStatus) {
                    await existingLike.updateOne({ status: likeStatus });
                }
            } else {
                await PostModel.create({ postId, userId, status: likeStatus, createdAt: new Date() });
            }
        }
        await updatePostLikeCounts(postId);
    }

}

const updatePostLikeCounts = async (postId:string)=>{
    const likesCount  = await LikeModelPosts.countDocuments({postId, status:LikeStatusEnum.LIKE})
    const dislikesCount  = await LikeModelPosts.countDocuments({postId, status:LikeStatusEnum.DISLIKE})

    // обновляем поля likesInfo
    await PostModel.findByIdAndUpdate(postId,{
        'extendedLikesInfo.likesCount':likesCount,
        'extendedLikesInfo.dislikesCount':dislikesCount,
    })
}



