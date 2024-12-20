import {agent as request} from 'supertest'
import {app} from "../../src/settings";
import mongoose from "mongoose";


const userCreateData = {
    login: "testtt",
    password: "testtt34",
    email: "miha25646@gmail.com"
};

let user;
let firstRefreshToken: any;

describe('/auth', () => {
    jest.setTimeout(10000)
    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    beforeAll(async () => {
        await mongoose.connect(mongoURI, {dbName:'testUser'})
       await request(app)
            .delete('/testing/all-data')

    });
    afterAll(async () => {
        await request(app)
            .delete('/testing/all-data')
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    it('should create user with correct input data', async () => {
        const createResponse = await request(app)
            .post('/users')
            .auth("admin", "qwerty")
            .send(userCreateData)
            .expect(201);
        expect(createResponse.body.login).toEqual(userCreateData.login);
        expect(createResponse.body.email).toEqual(userCreateData.email);
        expect(createResponse.body.id).toEqual(expect.any(String));
        user = createResponse.body;
    });
    //
    it('should login user first time', async () => {
        console.log('FIRST')
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
    });

    it('should login user second time', async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: userCreateData.login, password: userCreateData.password})
            .expect(200);
        const secondRefreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

        const sessionsResponse2 = await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${secondRefreshToken}`)
            .expect(200);

        expect(sessionsResponse2.body).toHaveLength(2);
    });

    it('should logout 1 user', async () => {
        await request(app)
            .post('/auth/logout')
            .set('Cookie', `refreshToken=${firstRefreshToken}`)
            .expect(204);
    });

    //третий логин который будем удалять
    it('should login user third time', async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: userCreateData.login, password: userCreateData.password})
            .expect(200);
        const thirdRefreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

        const sessionsResponse3 = await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${thirdRefreshToken}`)
            .expect(200);

        expect(sessionsResponse3.body).toHaveLength(2);
    });

    it('should delete all other sessions', async () => {
        // вход пользователя для получения активного токена сессии
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: userCreateData.login, password: userCreateData.password})
            .expect(200);

        const activeSessionToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

        // удаление всех других сессий, кроме текущей активной
        await request(app)
            .delete('/security/devices')
            .set('Cookie', `refreshToken=${activeSessionToken}`)
            .expect(204);
    });
    it('should delete sesssion by deviceId', async () => {
        //логинимся и получаем активный токен сессии
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: userCreateData.login, password: userCreateData.password})
            .expect(200);
        const activeSessionToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

        // получаем список сессий чтобы извлечь deviceId
        const sessionsResponse = await request(app)
            .get('/security/devices')
            .set('Cookie', `refreshToken=${activeSessionToken}`)
            .expect(200);

        //должна быть хотя бы 1 сессия
        const deviceId = sessionsResponse.body[0].deviceId

        //удаляем конкретную сессия по deviceId
        await request(app)
            .delete(`/security/devices/${deviceId}`)
            .set('Cookie', `refreshToken=${activeSessionToken}`)
            .expect(204);

        //провермяем что сессия удалена
        const deletingSession  =  await request(app)
            .get(`/security/devices/`)
            .set('Cookie', `refreshToken=${activeSessionToken}`)
            .expect(200);
        const deletedSessionIndex = deletingSession.body.findIndex((s: {deviceId:string})=>s.deviceId === deviceId)
        expect(deletedSessionIndex).toBe(-1)

        //пытаемся удалить несуществующую сессию
        await request(app)
            .delete(`/security/devices/${deviceId}`)
            .set('Cookie', `refreshToken=${activeSessionToken}`)
            .expect(404);

    });
})



