import {agent as request} from 'supertest'
import {app} from "../../src/settings";
import mongoose from "mongoose";

const incorrectUserData = {
    login: "",
    password: "",
    email: ""
}

const userCreateData = {
    login: "testtt",
    password: "testtt34",
    email: "miha25646@gmail.com"
}

let user;

describe('users', ()=>{
    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    beforeAll(async  ()=>{

        await mongoose.connect(mongoURI, {dbName:'testUser'})

    })
    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })
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

    it("shouldn't create user with incorrect input data", async ()=>{
        const createResponse=  await request(app)
            .post('/users')
            .auth("admin", "qwerty")
            .send(incorrectUserData)
            .expect(400)
        expect(createResponse.body.errorsMessages.length).toBe(3)
        expect(createResponse.body.errorsMessages[0].field).toEqual('login')
        expect(createResponse.body.errorsMessages[1].field).toEqual('password')
        expect(createResponse.body.errorsMessages[2].field).toEqual('email')

    })

    it("shouldn't create user without authorization", async ()=>{
        await request(app)
            .post('/users/' )
            .auth("adminnn", "qwerty")
            .send(userCreateData)
            .expect(401)


    })


    it('shouldn"t delete user by id without auth ', async ()=>{
        await request(app)
            .delete('/users/' + user!.id)
            .auth("admddin", "qwerfty")
            .expect(401)
    })

    it('should delete user', async ()=>{
        await request(app)
            .delete('/users/' + user!.id)
            .auth("admin", "qwerty")
            .expect(204)
    })

    it('shouldn"t delete user', async ()=>{
        await request(app)
            .delete('/users/' + user!.id)
            .auth("admin", "qwerty")
            .expect(404)
    })
    describe('get  All  Users', ()=>{
        let  user1
        let  user2
        let  user3
        it('create 1 user', async ()=>{
            const userCreateData = {
                login: "useruser1",
                password: "useruser1",
                email: "useruser1@gmail.com"

            }

            const createResponse=  await request(app)
                .post('/users')
                .auth("admin", "qwerty")
                .send(userCreateData)
                .expect(201)
            user1 = createResponse.body
            expect(createResponse.body).toEqual(user1!)

        })
        it('create 1 user', async ()=>{
            const userCreateData = {
                login: "useruser2",
                password: "useruser2",
                email: "useruser2@gmail.com"

            }

            const createResponse=  await request(app)
                .post('/users')
                .auth("admin", "qwerty")
                .send(userCreateData)
                .expect(201)
            user2 = createResponse.body
            expect(createResponse.body).toEqual(user2!)

        })
        it('create 1 user', async ()=>{
            const userCreateData = {
                login: "useruser3",
                password: "useruser3",
                email: "useruser3@gmail.com"

            }

            const createResponse=  await request(app)
                .post('/users')
                .auth("admin", "qwerty")
                .send(userCreateData)
                .expect(201)
            user3 = createResponse.body
            expect(createResponse.body).toEqual(user3!)

        })
    })

})
