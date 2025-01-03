import {Router} from "express";
import {authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {commentForPostValidation} from "../validators/post-validators";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {container} from "../composition-root";
import {CommentController} from "../controllers/comment-controller";

const commentController = container.resolve(CommentController)
export const commentRouter= Router({})


commentRouter.get('/:id', extractUserIdFromToken, commentController.getComment.bind(commentController));

commentRouter.put('/:id', authMiddlewareBearer, commentForPostValidation(), commentController.updateComment.bind(commentController))

commentRouter.delete('/:id',authMiddlewareBearer, commentController.deleteComment.bind(commentController))

commentRouter.put('/:id/like-status', authMiddlewareBearer, commentController.updateLikeStatus.bind(commentController))


