import {authMiddleware, authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {Router} from "express";
import {commentForPostValidation, postValidation} from "../validators/post-validators";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {postController} from "../composition-root";

export const postRoute = Router({})


postRoute.get('/',extractUserIdFromToken, postController.getPosts.bind(postController))

postRoute.get('/:id',extractUserIdFromToken, postController.getPostById.bind(postController))

postRoute.get('/:postId/comments', extractUserIdFromToken, postController.getCommentsForPost.bind(postController))

postRoute.post('/', authMiddleware, postValidation(), postController.createPost.bind(postController))

postRoute.post("/:postId/comments", authMiddlewareBearer, commentForPostValidation(), postController.createCommentForPost.bind(postController))

postRoute.put('/:id', authMiddleware, postValidation(), postController.updatePost.bind(postController))

postRoute.put('/:id/like-status', authMiddlewareBearer, postController.updateLikeStatus.bind(postController))

postRoute.delete('/:id', authMiddleware, postController.deletePost.bind(postController))



