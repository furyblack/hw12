import mongoose from "mongoose";
import request from "supertest";
import {app} from "../../src/settings";
import {PostOutputType} from "../../src/types/posts/output";
import {BlogOutputType} from "../../src/types/blogs/output";


require('dotenv').config();

const blogCreateData = {
    name: "test",
    description: "test",
    websiteUrl: "https://google.com"
}
let post: PostOutputType
let blog: BlogOutputType
let postId: string
let accessToken: string
let user: { id: string, login: string, email: string }
let firstRefreshToken: string;

const postCreateData = {
    title: "testpost",
    shortDescription: "testpostdescription",
    content: "test content for post",
    blogId: new mongoose.Types.ObjectId().toString()
}

const postUpdateData = {
    title: "updated testpost",
    shortDescription: "updated testpostdescription",
    content: "updated test content for post",
    blogId: new mongoose.Types.ObjectId().toString()
}

const incorrectPostData = {
    title: "",
    shortDescription: "",
    content: "",
    blogId: ""
}

const userCreateData = {
    login: "testUser",
    password: "testPassword",
    email: "testuser@example.com"
}
describe('likes to posts', () => {
        jest.setTimeout(10000)
        const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        beforeAll(async () => {
            await mongoose.connect(mongoURI, {dbName: 'testLikes'})
            await request(app).delete("/testing/all-data")
        })
        it('should create blog with correct input data', async () => {

            const createResponse = await request(app)
                .post('/blogs')
                .auth("admin", "qwerty")
                .send(blogCreateData)
                .expect(201)
            blog = createResponse.body; // СОХРАНЯЕМ БЛОГ АЙ ДИ
        })

        it('should create post with correct input data', async () => {
            postCreateData.blogId = blog.id as string
            postUpdateData.blogId = blog.id as string
            const createResponse = await request(app)

                .post('/posts')
                .auth('admin', 'qwerty')
                .send(postCreateData)
                .expect(201)
            expect(createResponse.body.title).toEqual(postCreateData.title)
            expect(createResponse.body.shortDescription).toEqual(postCreateData.shortDescription)
            expect(createResponse.body.content).toEqual(postCreateData.content)
            expect(createResponse.body.blogId).toEqual(postCreateData.blogId)
            expect(createResponse.body.id).toEqual(expect.any(String))
            post = createResponse.body
        })
        it('shouldn"t create post with incorrect input data', async () => {
            const createResponse = await request(app)
                .post('/posts')
                .auth('admin', 'qwerty')
                .send(incorrectPostData)
                .expect(400)
            expect(createResponse.body.errorsMessages.length).toEqual(4)
            expect(createResponse.body.errorsMessages[0].field).toEqual('title')
            expect(createResponse.body.errorsMessages[1].field).toEqual('shortDescription')
            expect(createResponse.body.errorsMessages[2].field).toEqual('content')
            expect(createResponse.body.errorsMessages[3].field).toEqual('blogId')
        })
        //создаем пользователя
        it('should create user with correct input data', async () => {
            const createResponse = await request(app)
                .post('/users')
                .auth("admin", "qwerty")
                .send(userCreateData)
                .expect(201)
            expect(createResponse.body.login).toEqual(userCreateData.login)
            expect(createResponse.body.email).toEqual(userCreateData.email)
            expect(createResponse.body.id).toEqual(expect.any(String))
            user = createResponse.body
        })
        //логинимся и получаем refresh token
        it('should login user first time', async () => {

            const loginResponse = await request(app)

                .post('/auth/login')
                .send({loginOrEmail: userCreateData.login, password: userCreateData.password})
                .expect(200);
            firstRefreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
            console.log('LOGIN', loginResponse.body)
            const sessionsResponse1 = await request(app)
                .get('/security/devices')
                .set('Cookie', `refreshToken=${firstRefreshToken}`)
                .expect(200);

            expect(sessionsResponse1.body).toHaveLength(1);
            accessToken = loginResponse.body.accessToken;
        });
        it('should like the post', async () => {
           console.log('test postId',post.id)

            await request(app)
                .put(`/posts/${post.id}/like-status`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({likeStatus: 'Like'})
                .expect(204)

            const getPostLikeResponse = await request(app)
                .get(`/posts/${post.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)

            expect(getPostLikeResponse.body.extendedLikesInfo.likesCount).toBe(1)
            expect(getPostLikeResponse.body.extendedLikesInfo.dislikesCount).toBe(0)
            expect(getPostLikeResponse.body.extendedLikesInfo.myStatus).toBe('Like')
        })

    }
)