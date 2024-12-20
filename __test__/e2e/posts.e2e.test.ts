import request  from "supertest";
import {app} from "../../src/settings";
import {BlogOutputType} from "../../src/types/blogs/output";
import {PostOutputType} from "../../src/types/posts/output";
import mongoose from "mongoose";

const incorrectPostData = {
    title: "",
    shortDescription: "",
    content: "",
    blogId: ""
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

const blogCreateData = {
    name: "test",
    description: "test",
    websiteUrl: "https://google.com"
}

let post: PostOutputType
let blog: BlogOutputType

describe('posts e2e test', () => {
    jest.setTimeout(10000)
    //const mongoURI = 'mongodb://localhost:27017'
    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    beforeAll(async ()=>{
        await mongoose.connect(mongoURI, {dbName: 'testLikes'})
    })

    describe('blogs', ()=> {

        it('should create blog with correct input data', async () => {

            const createResponse = await request(app)
                .post('/blogs')
                .auth("admin", "qwerty")
                .send(blogCreateData)
                .expect(201)
            blog = createResponse.body; // СОХРАНЯЕМ БЛОГ АЙ ДИ
        })
    })

    describe('posts', () => {
        describe('create Post', () =>{
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
            it('shouldn"t create post with incorrect input data', async ( )=>{
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
            it('shoudn"t create post with incorrect input data', async () =>{
                await request(app)
                    .post('/posts')
                    .auth('admdin', 'qwfferty')
                    .send(postCreateData)
                    .expect(401)
            })
            it('should get post by id', async () =>{
                const createResponse = await request(app)
                    .get('/posts/' + post.id)
                    .expect(200)
                expect(createResponse.body).toEqual(post!)
            })
            it('shouldn"t  get post by id', async ()=>{
                const nonExistingId = new mongoose.Types.ObjectId();
                await request(app)
                    .get('/posts/' + nonExistingId)
                    .expect(404)
            })

            it('should update post with correct input data', async () =>{
                 await request(app)
                    .put('/posts/' + post!.id)
                    .auth('admin','qwerty')
                    .send(postUpdateData)
                    .expect(204)
                console.log(postUpdateData)
            })

            it('shouldn"t update post with correct input data and incorrect blogId', async ()=>{
                 await request(app)
                    .put('/posts/' + post!.id )
                    .auth("admin", "qwerty")
                    .send(postUpdateData)
                    .expect(404)
            })

            it('shouldn"t update post without authorization ', async ()=>{
                await request(app)
                    .put('/posts/' + post!.id )
                    .auth("admnnin", "qweraty")
                    .send(postUpdateData)
                    .expect(401)
            })
            it('shouldn"t update post with incorrect data ', async ()=>{
                const createResponse=  await request(app)

                    .put('/posts/' + post!.id )
                    .auth("admin", "qwerty")
                    .send(incorrectPostData)
                    .expect(400)
                expect(createResponse.body.errorsMessages.length).toEqual(4)
                expect(createResponse.body.errorsMessages[0].field).toEqual('title')
                expect(createResponse.body.errorsMessages[1].field).toEqual('shortDescription')
                expect(createResponse.body.errorsMessages[2].field).toEqual('content')
                expect(createResponse.body.errorsMessages[3].field).toEqual('blogId')
            })

            it('should get post by id with new data', async ()=>{
                const createResponse=  await request(app)
                    .get('/posts/' + post!.id)
                    .expect(200)
                expect(createResponse.body.title).toEqual(postUpdateData.title)
                expect(createResponse.body.shortDescription).toEqual(postUpdateData.shortDescription)
                expect(createResponse.body.content).toEqual(postUpdateData.content)
                expect(createResponse.body.blogId).toEqual(postUpdateData.blogId)
                expect(createResponse.body.id).toEqual(post.id)
            })

            it('shouldn"t delete post by id wihtout auth ', async ()=>{
                 await request(app)
                    .delete('/posts/' + post!.id)
                    .auth("admddin", "qwerfty")
                    .expect(401)
            })
            it('should delete post', async ()=>{
                 await request(app)
                    .delete('/posts/' + post!.id)
                    .auth("admin", "qwerty")
                    .expect(204)
            })
            it('shouldn"t delete post', async ()=>{
                await request(app)
                    .delete('/posts/' + post!.id)
                    .auth("admin", "qwerty")
                    .expect(404)
            })
        })
    })
})


