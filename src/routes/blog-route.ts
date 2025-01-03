import {Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {blogValidation} from "../validators/blog-validators";
import {postForBlogValidation} from "../validators/post-validators";
import { container} from "../composition-root";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {BlogController} from "../controllers/blog-controller";


const blogController = container.resolve(BlogController)
export const blogRoute = Router({});


blogRoute.get('/',  blogController.getBlogs)

blogRoute.get('/:id', blogController.getBlogById)

blogRoute.get('/:blogId/posts', extractUserIdFromToken, blogController.getPostsForBlog)

blogRoute.post('/', authMiddleware, blogValidation(), blogController.createBlog.bind(blogController))

blogRoute.post('/:blogId/posts', authMiddleware, postForBlogValidation(),  blogController.createPostForBlog.bind(blogController))

blogRoute.put('/:id', authMiddleware, blogValidation(), blogController.updateBlog.bind(blogController))

blogRoute.delete('/:id', authMiddleware, blogController.deleteBlog.bind(blogController))



