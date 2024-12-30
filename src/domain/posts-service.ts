import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostOutputType} from "../types/posts/output";
import {queryBlogRepo} from "../repositories/query-blog-repository";
import {PostDb, PostModel} from "../db/posts-model";
import {ObjectId} from "mongodb";
import {queryPostRepo} from "../repositories/query-post-repository";
import {PostRepository} from "../repositories/post-repository";
import {LikeModelPosts, LikeStatusEnum} from "../db/likes-model";
import {UsersRepository} from "../repositories/users-repository";


export class PostService{
    constructor(protected postRepo:PostRepository, protected userRepo:UsersRepository) {
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
            return await this.postRepo.deletePost(id); // Возвращаем результат из репозитория
        } catch (error) {
            console.error("Error deleting post", error);
            return false; // Возвращаем false в случае ошибки
        }
    }

    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatusEnum): Promise<void> {
        const existingLike = await LikeModelPosts.findOne({ postId, userId });

        const user = await this.userRepo.findUserById(userId)

        if (likeStatus === LikeStatusEnum.NONE) {
            console.log('1')
            if (existingLike) {
                await existingLike.deleteOne();
            }
        } else {
            if (existingLike) {
                console.log('2')
                if (existingLike.status !== likeStatus) {
                    console.log('3')
                    await existingLike.updateOne({ status: likeStatus });
                }
            } else {
                console.log('4')
                const  likeModel =  await LikeModelPosts.create({ postId, userId, status: likeStatus, createdAt: new Date() , login:user?.accountData.userName });
                await likeModel.save()
            }
        }
        await updatePostLikeCounts(postId);
    }

}

const updatePostLikeCounts = async (postId:string)=>{
    const likesCount  = await LikeModelPosts.countDocuments({postId, status:LikeStatusEnum.LIKE})
    const dislikesCount  = await LikeModelPosts.countDocuments({postId, status:LikeStatusEnum.DISLIKE})
    const newestLikes = await LikeModelPosts.find(
        {postId, status:LikeStatusEnum.LIKE}
        )
        .sort({'createdAt':-1})
        .limit(3)
        .lean()

    console.log('likeCount', likesCount)
    console.log('dislikesCount', dislikesCount)

    const  lastTreeLikes = newestLikes.map(like=>{
        return{
            addedAt:like.createdAt,
            userId: like.userId,
            login:like.login
        }
    })


             //обновляем поля likesInfo
    await PostModel.findByIdAndUpdate(postId,{
        'extendedLikesInfo.likesCount':likesCount,
        'extendedLikesInfo.dislikesCount':dislikesCount,
        'extendedLikesInfo.newestLikes': lastTreeLikes,
    })
}



