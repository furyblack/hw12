import mongoose from "mongoose";
import {agent as request} from 'supertest'
import {app} from "../../src/settings";
import {PostOutputType} from "../../src/types/posts/output";
import {BlogOutputType} from "../../src/types/blogs/output";

require('dotenv').config();
const userCreateData = {
    login:"testUser",
    password:"testPassword",
    email:"testuser@example.com"
}

const blogCreateData = {
    name: "test",
    description: "test",
    websiteUrl: "https://google.com"
}

const postCreateData = {
    title: "testpost",
    shortDescription: "testpostdescription",
    content: "test content for post",
    blogId:  new mongoose.Types.ObjectId().toString()
}
const postUpdateData = {
    title: "updated testpost",
    shortDescription: "updated testpostdescription",
    content: "updated test content for post",
    blogId: new mongoose.Types.ObjectId().toString()
}

let post: PostOutputType
let blog: BlogOutputType
let accessToken: string
let firstRefreshToken: string;
let user: {id:string, login:string, email:string}
let commentId: string

describe('/comments', ()=> {
    jest.setTimeout(10000)
    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
     //const mongoURI = 'mongodb://localhost:27017'
    beforeAll(async () => {

        await mongoose.connect(mongoURI, {dbName: 'testLikes'}) //'testUser'
        await request(app).delete("/testing/all-data")
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await request(app).delete('/testing/all-data')
        await mongoose.connection.close()
    });



    //создаем пользователя
    it('should create user with correct input data', async ()=>{
        const createResponse=  await request(app)
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
        console.log('MISTAKE')
        firstRefreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
        console.log('LOGIN', loginResponse.body)
        const sessionsResponse1 = await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${firstRefreshToken}`)
            .expect(200);

        expect(sessionsResponse1.body).toHaveLength(1);
        accessToken = loginResponse.body.accessToken;
    });
    //создаем блог
    it('should create blog with correct input data', async () => {

        const createResponse = await request(app)
            .post('/blogs')
            .auth("admin", "qwerty")
            .send(blogCreateData)
            .expect(201)
        blog = createResponse.body; // СОХРАНЯЕМ БЛОГ АЙ ДИ
    })

    //создаем пост и комент
    it('should create post with correct input data', async () =>{
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

    it('should create comment for post', async () => {
        const commentCreateData = {
            content: "This is a test comment for the post."
        };

        const createCommentResponse = await request(app)
            .post(`/posts/${post.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(commentCreateData)
            .expect(201);

        expect(createCommentResponse.body.content).toEqual(commentCreateData.content);
        expect(createCommentResponse.body.commentatorInfo.userId).toEqual(user.id);
        expect(createCommentResponse.body.commentatorInfo.userLogin).toEqual(user.login);
        expect(createCommentResponse.body.id).toEqual(expect.any(String));

        commentId = createCommentResponse.body.id;
    });

    it('should like the comment', async ()=>{
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({likeStatus:'Like'})
            .expect(204)

        const getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)


        expect(getCommentResponse.body.likesInfo.likesCount).toBe(1)
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(0)
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('Like')
    })
    it('should dislike the comment', async ()=>{
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({likeStatus:'Dislike'})
            .expect(204)

        const getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)


        expect(getCommentResponse.body.likesInfo.likesCount).toBe(0)
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(1)
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('Dislike')

    })

    it('should reset like to "None" and update like count', async () => {
        // Лайк комментария
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ likeStatus: 'Like' })
            .expect(204);

        // Проверяем, что лайк успешно применён
        let getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(getCommentResponse.body.likesInfo.likesCount).toBe(1);
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('Like');

        // Сброс лайка (устанавливаем статус на "None")
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ likeStatus: 'None' })
            .expect(204);

        // Проверяем, что лайк был сброшен
        getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(getCommentResponse.body.likesInfo.likesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('None');
    });

    it('should reset dislike to "None" and update dislike count', async () => {
        // Дизлайк комментария
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ likeStatus: 'Dislike' })
            .expect(204);

        // Проверяем, что дизлайк успешно применён
        let getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(getCommentResponse.body.likesInfo.likesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(1);
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('Dislike');

        // Сброс дизлайка (устанавливаем статус на "None")
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ likeStatus: 'None' })
            .expect(204);

        // Проверяем, что дизлайк был сброшен
        getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(getCommentResponse.body.likesInfo.likesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(0);
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('None');
    });

})