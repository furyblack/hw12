import request from 'supertest'
import {app} from "../../src/settings";
import mongoose from "mongoose";

const incorrectBlogData = {
    name: "",
    description: "",
    websiteUrl: ""
}

const blogCreateData = {
    name: "test",
    description: "test",
    websiteUrl: "https://google.com"
}

const blogUpdateData = {
    name: "updated name",
    description: "updated description",
    websiteUrl: "https://google1.com"
}
let blog;

describe('blogs', ()=>{
     const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    //const mongoURI = 'mongodb://localhost:27017'
    beforeAll(async () => {
        await mongoose.connect(mongoURI, {dbName:'testUser'})
    });
    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })
    it('should create blog with correct input data', async ()=>{
        const createResponse=  await request(app)
            .post('/blogs')
            .auth("admin", "qwerty")
            .send(blogCreateData)
            .expect(201)
            expect(createResponse.body.name).toEqual(blogCreateData.name)
            expect(createResponse.body.description).toEqual(blogCreateData.description)
            expect(createResponse.body.websiteUrl).toEqual(blogCreateData.websiteUrl)
            expect(createResponse.body.id).toEqual(expect.any(String))
            //записываем данные полученного блога
        blog = createResponse.body
    })

    it("shouldn't create blog with incorrect input data", async ()=>{
        const createResponse=  await request(app)
            .post('/blogs')
            .auth("admin", "qwerty")
            .send(incorrectBlogData)
            .expect(400)
        expect(createResponse.body.errorsMessages.length).toBe(3)
        expect(createResponse.body.errorsMessages[0].field).toEqual('name')
        expect(createResponse.body.errorsMessages[1].field).toEqual('description')
        expect(createResponse.body.errorsMessages[2].field).toEqual('websiteUrl')
    })

    it("shouldn't create blog without authorization", async ()=>{
        await request(app)
            .post('/blogs/' )
            .auth("adminnn", "qwerty")
            .send(blogCreateData)
            .expect(401)
    })
    it('should get blog by id', async ()=>{
        const createResponse=  await request(app)
            .get('/blogs/' + blog!.id)
            .expect(200)
        expect(createResponse.body).toEqual(blog!)

    })
    it('shouldn"t  get blog by id', async ()=>{
        await request(app)
            .get('/blogs/' + '54554')
            .expect(404)
    })

    it('should update blog with correct input data', async ()=>{
        await request(app)
            .put('/blogs/' + blog!.id )
            .auth("admin", "qwerty")
            .send(blogUpdateData)
            .expect(204)
    })


    it('shouldn"t update blog with correct input data and incorrect blogId', async ()=>{
        await request(app)
            .put('/blogs/' + '999999' )
            .auth("admin", "qwerty")
            .send(blogUpdateData)
            .expect(404)
    })

    it('shouldn"t update blog without authorization ', async ()=>{
        await request(app)
            .put('/blogs/' + blog!.id )
            .auth("admnnin", "qweraty")
            .send(blogUpdateData)
            .expect(401)
    })

    it('shouldn"t update blog with incorrect data ', async ()=>{
        const createResponse=  await request(app)

            .put('/blogs/' + blog!.id )
            .auth("admin", "qwerty")
            .send(incorrectBlogData)
            .expect(400)
        expect(createResponse.body.errorsMessages.length).toEqual(3)
        expect(createResponse.body.errorsMessages[0].field).toEqual('name')
        expect(createResponse.body.errorsMessages[1].field).toEqual('description')
        expect(createResponse.body.errorsMessages[2].field).toEqual('websiteUrl')
    })

    it('should get blog by id with new data', async ()=>{
        const createResponse=  await request(app)
            .get('/blogs/' + blog!.id)
            .expect(200)
        expect(createResponse.body.name).toEqual(blogUpdateData.name)
        expect(createResponse.body.description).toEqual(blogUpdateData.description)
        expect(createResponse.body.websiteUrl).toEqual(blogUpdateData.websiteUrl)
        expect(createResponse.body.id).toEqual(expect.any(String))
        blog = createResponse.body
    })

    it('shouldn"t delete blog by id wihtout auth ', async ()=>{
        await request(app)
            .delete('/blogs/' + blog!.id)
            .auth("admddin", "qwerfty")
            .expect(401)
    })

    it('should delete blog', async ()=>{
        await request(app)
            .delete('/blogs/' + blog!.id)
            .auth("admin", "qwerty")
            .expect(204)
    })

    it('shouldn"t delete blog', async ()=>{
        await request(app)
            .delete('/blogs/' + blog!.id)
            .auth("admin", "qwerty")
            .expect(404)
    })
})
