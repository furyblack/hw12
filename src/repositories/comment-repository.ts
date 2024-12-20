import {CommentOutputType} from "../types/comment/output-comment-type";
import {ObjectId, WithId} from "mongodb";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {queryCommentRepo} from "./query-comment-repository";
import {LikeStatusEnum} from "../db/likes-model";
import {CommentModel, CommentMongoDbType} from "../db/comment-model";

export class CommentMapper {
    static toDto(comment: WithId<CommentMongoDbType>, likeStatus:LikeStatusEnum = LikeStatusEnum.NONE): CommentOutputType {
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo:comment.commentatorInfo,
            createdAt: comment.createdAt.toISOString(),
            likesInfo:{
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: likeStatus
            }
        }
    }
}

export class CommentRepository {
     async findById(commentId: string):Promise<WithId<CommentMongoDbType> | null>{

        return  CommentModel.findOne({_id: new ObjectId(commentId)})
    }

     async createComment(commentParams:CommentMongoDbType):Promise<{commentId: string}>{

        const cteatedCommentData  = await CommentModel.create(commentParams)
        return {
            commentId: cteatedCommentData._id.toString(),
        }
    }

      async updateComment(commentId: string, updateData:UpdateCommentType):Promise<boolean|null>{
        const post = await queryCommentRepo.getById(commentId)
        if(!post){
            return null
        }
        const updateResult= await CommentModel.updateOne({_id: new ObjectId(commentId)},{$set:{...updateData}})
        const updatedCount = updateResult.modifiedCount
        return !!updatedCount;
    }

     async deleteComment(id:string):Promise<boolean>{
        try {
            const result = await CommentModel.deleteOne({_id: new ObjectId(id)})
            return result.deletedCount===1;
        }catch (error){
            console.error("Error deleting comment", error)
            return false
        }
    }
}



