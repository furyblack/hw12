import {ObjectId, WithId} from "mongodb";
import {CommentOutputType} from "../types/comment/output-comment-type";
import {CommentMapper} from "./comment-repository";
import {CommentModel, CommentMongoDbType} from "../db/comment-model";
import {LikeModel, LikeStatusEnum} from "../db/likes-model";
import {injectable} from "inversify";
@injectable()
export class QueryCommentRepository {

     async getById(id: string, userId?:string): Promise<CommentOutputType | null> {
        const comment: WithId<CommentMongoDbType> | null = await CommentModel.findOne({_id: new ObjectId(id)})
        if (!comment) {
            return null
        }
        let likeStatus = LikeStatusEnum.NONE
        if(userId){
            const  status  = await LikeModel.findOne({commentId:id, userId:userId})
            if(status){
                likeStatus = status.status
            }
        }
        return CommentMapper.toDto(comment, likeStatus)
    }
}

export const queryCommentRepo = new QueryCommentRepository()