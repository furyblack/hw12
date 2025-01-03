import "reflect-metadata"
import {UsersRepository} from "./repositories/users-repository";
import {UsersService} from "./domain/users-service";
import {CommentRepository} from "./repositories/comment-repository";
import {CommentService} from "./domain/comment-service";
import {PostRepository} from "./repositories/post-repository";
import {PostService} from "./domain/posts-service";
import {BlogRepository} from "./repositories/blog-repository";
import {BlogsService} from "./domain/blogs-service";
import {UserController} from "./controllers/user-controller";
import {CommentController} from "./controllers/comment-controller";
import {BlogController} from "./controllers/blog-controller";
import {PostController} from "./controllers/post-controller";
import {Container} from "inversify";
import {QueryPostRepository} from "./repositories/query-post-repository";
import {QueryBlogRepository} from "./repositories/query-blog-repository";
import {QueryCommentRepository} from "./repositories/query-comment-repository";


//REPO
const userRepo = new UsersRepository()
const postRepo = new PostRepository()
const commentRepo = new CommentRepository()
const blogRepo = new BlogRepository()

//Service
export const userService = new UsersService(userRepo)
export const postService = new PostService(postRepo, userRepo)
export const commentService = new CommentService(commentRepo, postRepo)
export const blogService = new BlogsService(blogRepo)

//Controller
// export const userController = new UserController(userService)
// export const postController = new PostController(postService, postRepo,commentService)
// export const commentController = new CommentController(commentService, commentRepo)
// export const blogController = new BlogController(blogService, blogRepo,postService)



export const container = new Container()
container.bind(UserController).to(UserController)
container.bind(UsersService).to(UsersService)
container.bind(UsersRepository).to(UsersRepository)

container.bind(PostController).to(PostController)
container.bind(PostService).to(PostService)
container.bind(PostRepository).to(PostRepository)
container.bind(QueryPostRepository).to(QueryPostRepository)

container.bind(BlogController).to(BlogController)
container.bind(BlogsService).to(BlogsService)
container.bind(BlogRepository).to(BlogRepository)
container.bind(QueryBlogRepository).to(QueryBlogRepository)

container.bind(CommentController).to(CommentController)
container.bind(CommentService).to(CommentService)
container.bind(CommentRepository).to(CommentRepository)
container.bind(QueryCommentRepository).to(QueryCommentRepository)



