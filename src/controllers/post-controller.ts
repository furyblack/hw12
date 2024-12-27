import {PostService} from "../domain/posts-service";
import {PostRepository} from "../repositories/post-repository";
import {CommentService} from "../domain/comment-service";
import {RequestWithBody, RequestWithParamsAndBody, RequestWithQuery, RequestWithQueryAndParams} from "../types/common";
import {CreateNewPostType, postQuerySortData, UpdatePostType} from "../types/posts/input";
import {Request, Response} from "express";
import {PaginationOutputType} from "../types/blogs/output";
import {PostOutputType} from "../types/posts/output";
import {paginator} from "../types/paginator/pagination";
import {queryPostRepo} from "../repositories/query-post-repository";
import {ObjectId} from "mongodb";
import {CreateNewCommentType} from "../types/comment/input-comment-type";
import {CommentOutputType} from "../types/comment/output-comment-type";
import {queryCommentRepo} from "../repositories/query-comment-repository";
import {PostModel} from "../db/posts-model";
import {LikeModel, LikeModelPosts} from "../db/likes-model";

export class PostController {

    constructor(protected postService: PostService, protected postRepo: PostRepository, protected commentService: CommentService) {

    }

    async getPosts(req: RequestWithQuery<postQuerySortData>, res: Response<PaginationOutputType<PostOutputType[]>>) {
        const paginationData = paginator(req.query)
        const posts = await queryPostRepo.getAll(paginationData)
        res.send(posts)
    }

    async getPostById(req: Request, res: Response) {
        // const postId = await queryPostRepo.getById(req.params.id);
        const postId = req.params.id
        const userId = req.userDto ? req.userDto._id.toString() : null;
        console.log('uuserID on c',userId)

        const post = await queryPostRepo.getById(postId)
        if (!post) {
            return res.sendStatus(404);
        }

        let myStatus = 'None';
        if (userId) {
            const userLike = await LikeModelPosts.findOne({postId, userId});
            if (userLike) {
                myStatus = userLike.status;
            }
        }
        // if (postId) {
        //     res.status(200).send(postId)
        // } else {
        //     res.sendStatus(404)
        // }

        const responsePost = {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,  //БЫЛО TO iSO STRING
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: myStatus,
                newestLikes: []
            }

        }
        res.status(200).send(responsePost);
        return

    }

    async getCommentsForPost(req: RequestWithQueryAndParams<{
        postId: string
    }, postQuerySortData>, res: Response) {
        const postId = req.params.postId
        const paginationData = paginator(req.query)
        const userId = req.userDto ? req.userDto._id.toString() : null;
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const foundPost = await this.postRepo.findPostById(postId)
        if (!foundPost) {
            res.sendStatus(404)
            /**
             * справка от Семена по статусам)
             * status - просто сетает сататус в запросе но не отправляет его
             * send -  сетает тело запроса и отправляет ответ на фронт (если не указан статус будет отправлен дефолтный например 200)
             * sendStatus просто их смесь ( укороченый синтаксис -> отправка пустого бади и статуса который укажешь )
             */
            return
        }
        try {
            const comments = await queryPostRepo.getAllCommentsForPost(postId, paginationData, userId)
            res.status(200).send(comments)
            return
        } catch (error) {
            console.error("Error fetching comments for post:", error)
            res.status(500).json({message: 'Internal server error'})
            return
        }
    }

    async createPost(req: RequestWithBody<CreateNewPostType>, res: Response<PostOutputType>) {
        const {title, shortDescription, content, blogId}: CreateNewPostType = req.body
        const addResult = await this.postService.createPost({title, shortDescription, content, blogId})
        if (!addResult) {
            res.sendStatus(404)
            return
        }
        res.status(201).send(addResult)
    }

    async createCommentForPost(req: RequestWithParamsAndBody<{
        postId: string
    }, CreateNewCommentType>, res: Response<CommentOutputType>) {

        const postId = req.params.postId;
        const content = req.body.content;
        const userId = req.userDto._id.toString();
        const userLogin = req.userDto.accountData.userName;
        const createResult = await this.commentService.createComment({content, postId, userId, userLogin})
        //если поста нет то 404
        if (!createResult) return res.sendStatus(404)

        const createdComment = await queryCommentRepo.getById(createResult.commentId)

        return res.status(201).send(createdComment!)
    }

    async updatePost(req: Request, res: Response) {
        const postUpdateParams: UpdatePostType = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content
        }
        const postId = req.params.id

        const isUpdated = await this.postService.updatePost(postId, postUpdateParams)
        if (isUpdated) {
            return res.sendStatus(204)
        } else {
            return res.sendStatus(404)
        }

    }

    async deletePost(req: Request, res: Response) {
        const isDeleted = await this.postService.deletePost(req.params.id)
        if (!isDeleted) {
            res.sendStatus(404)
        } else {
            res.sendStatus(204)
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
                const postsExists = await PostModel.findById(id)
                if (!postsExists) {
                    return res.status(404).send({errorMessages: [{message: 'Post not found', field: 'postId'}]})
                }

                await this.postService.updateLikeStatus(id, userId, likeStatus)
                return res.sendStatus(204)
             } catch (error) {
                console.error('Error updating like status:', error);
                return res.status(500).send({error: 'Something went wrong'});
            }
        }
    }

}