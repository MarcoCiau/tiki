import request from "../config/testConfig";
import {connectDB, disconnectDB } from "../config/db";
const authURLBase : string = "/api/v1/auth";
let accessToken: string = "*";
let refreshToken: string = "*";
beforeAll(() => jest.setTimeout(90 * 1000));

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
            .send({
                name: "",
                email: "user@mail.com",
                password: "123"
            });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Email - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({
                name: "user_test",
                email: "usermail.com",
                password: "123456789"
            });
        expect(response.statusCode).toBe(400);
    });

    test("Bad Password - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({
                name: "user test",
                email: "user@mail.com",
                password: "123"
            });
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
            .send({
                name: "user test",
                email: "testUser4@email.com",
                password: "qwertyui8"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();
    });

    test("email exists - It should respond with an bad request", async () => {
        const response = await request
            .post(authURLBase + "/signup")
            .send({
                name: "user test",
                email: "testUser4@email.com",
                password: "qwertyui"
            });
        expect(response.statusCode).toBe(400);
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
        const response = await request
            .post(authURLBase + "/signin")
            .send({
                email: "testUser3@email.com",
                password: "qwertyui8"
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
        const response = await request
            .post(authURLBase + "/signin")
            .send({
                email: "testUser3@email.com",
                password: "qwertyui8"
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

describe("DB Disconnection", () => {
    test("It should return true if database is disconnected successfully", async () => {
        const disconnected = await disconnectDB();
        expect(disconnected).toBeTruthy();
    });
});