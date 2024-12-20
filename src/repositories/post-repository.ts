import {UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {ObjectId, WithId} from "mongodb";
import {PostDb, PostModel} from "../db/posts-model";


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

export class PostRepository{
     async createPost(newPost: PostDb): Promise<PostOutputType | null>{
         const newPostToDb = new PostModel(newPost)
         await newPostToDb.save()
         return PostMapper.toDto({...newPost, _id:newPostToDb._id})
    }

     async  updatePost(postId: string,  updateData:UpdatePostType): Promise<boolean | null>{
         const updateResult = await PostModel.updateOne({_id: new ObjectId(postId)}, {$set:{...updateData}})
         const updatedCount = updateResult.modifiedCount
         return Boolean(updatedCount);
    }

    async deletePost(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1; // Возвращаем true, если удалена одна запись
    }

     async findPostById(postId:string):Promise<WithId<PostMongoDbType>|null>{
        return PostModel.findOne({_id: new ObjectId(postId)})
    }
}




