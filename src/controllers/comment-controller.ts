import {CommentService} from "../domain/comment-service";
import {CommentRepository} from "../repositories/comment-repository";
import {Request, Response} from "express";
import {queryCommentRepo} from "../repositories/query-comment-repository";
import {LikeModel} from "../db/likes-model";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {CommentModel} from "../db/comment-model";
import {injectable} from "inversify";

@injectable()
export class CommentController {


    constructor(protected commentService: CommentService, protected commentRepo: CommentRepository) {

    }

    async getComment(req: Request, res: Response) {
        {
            const commentId = req.params.id;
            const userId = req.userDto ? req.userDto._id.toString() : null;

            const comment = await queryCommentRepo.getById(commentId);

            if (!comment) {
                return res.sendStatus(404);
            }

            let myStatus = 'None';

            if (userId) {
                const userLike = await LikeModel.findOne({commentId, userId});
                if (userLike) {
                    myStatus = userLike.status;
                }
            }

            const responseComment = {
                id: comment.id,
                content: comment.content,
                commentatorInfo: comment.commentatorInfo,
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: myStatus,
                }
            };

            res.status(200).send(responseComment);
            return
        }
    }

    async updateComment(req: Request, res: Response) {
        {
            const commentUpdateParams: UpdateCommentType = {
                content: req.body.content
            }
            const commentId = req.params.id

            const userId = req.userDto._id

            const foundComment = await this.commentRepo.findById(commentId)
            if (foundComment && foundComment?.commentatorInfo.userId.toString() !== userId.toString()) {
                return res.sendStatus(403)
            }
            await this.commentRepo.updateComment(commentId, commentUpdateParams)
            if (!foundComment) return res.sendStatus(404)
            return res.sendStatus(204)
        }
    }

    async deleteComment(req: Request, res: Response) {
        {
            const commentId = req.params.id

            const userId = req.userDto._id

            const foundComment = await this.commentRepo.findById(commentId)
            if (foundComment && foundComment?.commentatorInfo.userId.toString() !== userId.toString()) {
                return res.sendStatus(403)
            }

            await this.commentRepo.deleteComment(commentId)
            if (!foundComment) return res.sendStatus(404)
            return res.sendStatus(204)
        }
    }

    async updateLikeStatus(req: Request, res: Response) {
        {
            const id = req.params.id
            const {likeStatus} = req.body
            const userId = req.userDto._id.toString()

            if (!['None', 'Like', 'Dislike'].includes(likeStatus)) {
                return res.status(400).send({errorsMessages: [{message: 'Invalid like status', field: 'likeStatus'}]})
            }

            try {
                const commentsExists = await CommentModel.findById(id)
                if (!commentsExists) {
                    return res.status(404).send({errorMessages: [{message: 'Comment not found', field: 'commentId'}]})
                }

                await this.commentService.updateLikeStatus(id, userId, likeStatus)
                return res.sendStatus(204)
            } catch (error) {
                console.error('Error updating like status:', error);
                return res.status(500).send({error: 'Something went wrong'});
            }
        }
    }
}