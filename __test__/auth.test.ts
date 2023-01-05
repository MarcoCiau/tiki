import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
import UserModel from "../models/user";
const authURLBase: string = "/api/v1/auth";
let accessToken: string = "*";
let refreshToken: string = "*";

interface newUser {
    name?: string,
    email: string,
    password: string,
    timezone?: string,
}

const userData: newUser = {
    name: "user1",
    email: 'user1@mail.com',
    password: 'Secret1234',
    timezone: "America/Merida"
}

beforeAll(() => jest.setTimeout(90 * 1000));

// Cleans up database between each test
afterEach(async () => {
    await UserModel.deleteMany()
})

describe("DB Connection", () => {
    test("It should return true if database is connected successfully", async () => {
        const db = await connectDB();
        expect(db).toBeTruthy();
    });
});

// user registration test
describe("User Signup Test", () => {
    test("No User Name - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({ ...userData, name: "" });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Email - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({ ...userData, email: "usermail.com" });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Password - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({ ...userData, password: "123" });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Timezone value - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({ ...userData, timezone: 3 });
        expect(response.statusCode).toBe(400);
    });

    test("Empty Request's body - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({});
        expect(response.statusCode).toBe(400);
    });

    test("Signup Success - It should respond with user payload, accessToken & refreshToken", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send(userData);

        expect(response.statusCode).toBe(201);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();
    });

    test("email exists - It should respond with an bad request", async () => {
        // it('returns E-mail in use when user signup with an email that is already in use', async () => {
        const userDoc = new UserModel({...userData});
        await userDoc.save();
        const query =  await UserModel.findOne({email: userData.email});
        expect(userData.email).toBe(query?.email);
        const response = await request
            .post(authURLBase + "/signup")
            .send(userData);
        expect(response.statusCode).toBe(400);
        expect(userData.email).toBe(query?.email);
    });
});

// user login test
describe("User Signin Test", () => {
    test("No Credentials - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signin")
            .send({
                email: "",
                password: ""
            });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Email - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signin")
            .send({
                email: "usermailcom",
                password: "123456789"
            });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Password - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signin")
            .send({
                email: "user@mail.com",
                password: "123"
            });
        expect(response.statusCode).toBe(400);
    });

    test("Empty Request's body - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signin")
            .send({});
        expect(response.statusCode).toBe(400);
    });

    test("Signin Success - It should respond with user payload, accessToken & refreshToken", async () => {
        //workaround : signup before due the DB drop each test
        await request
            .post(authURLBase + "/signup")
            .send(userData);
        // execute Signin
        const response = await request
        .post(authURLBase + "/signin")
        .send({
            email: userData.email,
            password: userData.password
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();
    });
});

// user refresh token test
describe("User Refresh Token - Test ", () => {
    test("Signin Success - It should respond with user payload, accessToken & refreshToken", async () => {
        //workaround : signup before due the DB drop each test
        await request
        .post(authURLBase + "/signup")
        .send(userData);
        // execute Signin
        const response = await request
        .post(authURLBase + "/signin")
        .send({
            email: userData.email,
            password: userData.password
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();

        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });

    test("Empty Request's body - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/refreshToken")
            .send({});
        expect(response.statusCode).toBe(400);
    });

    test("Refresh token value is empty - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/refreshToken")
            .send({
                refreshToken: "",
            });
        expect(response.statusCode).toBe(400);
    });


    test("Refresh token value is old  - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/refreshToken")
            .send({
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Mjc5NzUzZGI3N2MxMGEyNjkyNGM1NjkiLCJpYXQiOjE2NTIxMjcyNzIsImV4cCI6MTY1MjEyNzMzMn0.eEq0Yzo1TZpdp0vYiFyZ_dbsn_jhOYYa7m6o8rR1iWo",
            });
        expect(response.statusCode).toBe(400);
    });

    test("Refresh token value is an access token  - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/refreshToken")
            .send({
                refreshToken: accessToken,
            });
        expect(response.statusCode).toBe(400);
    });

    test("Refresh token updated - It should respond the new refresh token & access token", async () => {
        const response = await request
            .post(authURLBase + "/refreshToken")
            .send({
                refreshToken,
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();
    });
});

// describe("DB Disconnection", () => {
//     test("It should return true if database is disconnected successfully", async () => {
//         const disconnected = await disconnectDB();
//         expect(disconnected).toBeTruthy();
//     });
// });