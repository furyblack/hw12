import express, {Request, Response} from "express";
import {postRoute} from "./routes/post-route";
import {blogRoute} from "./routes/blog-route";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-router";
import {commentRouter} from "./routes/comment-router";
import cookieParser from "cookie-parser";
import {deviceRouter} from "./routes/device-router";
import {BlogModel} from "./db/blogs-model";
import {PostModel} from "./db/posts-model";
import {UserModel} from "./db/user-model";
import {SessionModel} from "./db/session-model";
import {RequestCountModel} from "./db/requestcount-model";
import {CommentModel} from "./db/comment-model";
import {LikeModel} from "./db/likes-model";

export const app = express();

// подключение роутеров
app.use(cookieParser())
app.use(express.json())
app.use('/posts', postRoute)
app.use('/blogs', blogRoute)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentRouter)
app.use('/security', deviceRouter)


app.delete('/testing/all-data', async (req:Request, res: Response)=>{
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await UserModel.deleteMany({})
    await SessionModel.deleteMany({})
    await RequestCountModel.deleteMany({})
    await CommentModel.deleteMany({})
    await LikeModel.deleteMany({})
    res.sendStatus(204)
})