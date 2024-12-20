import {Router} from "express";
import {authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {commentForPostValidation} from "../validators/post-validators";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {commentController} from "../composition-root";


export const commentRouter= Router({})

//миддл вар для получения комента всем пользователям( и даже не авторизованным)


commentRouter.get('/:id', extractUserIdFromToken, commentController.getComment.bind(commentController));

commentRouter.put('/:id', authMiddlewareBearer, commentForPostValidation(), commentController.updateComment.bind(commentController))

commentRouter.delete('/:id',authMiddlewareBearer, commentController.deleteComment.bind(commentController))

commentRouter.put('/:id/like-status', authMiddlewareBearer, commentController.updateLikeStatus.bind(commentController))


