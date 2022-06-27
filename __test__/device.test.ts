import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
const deviceURLBase: string = "/api/v1/device";
let accessToken: string = "*";
beforeAll(() => jest.setTimeout(90 * 1000));
describe("DB Connection", () => {
    test("It should return true if database is connected successfully", async () => {
        const db = await connectDB();
        expect(db).toBeTruthy();
    });
});


// new device test
describe("Creating a new device - Test ", () => {
    test("Signin Success - It should respond with user payload, accessToken & refreshToken", async () => {
        const response = await request
            .post("/api/v1/auth/signin")
            .send({
                email: "testuser3@email.com",
                password: "qwertyui8"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.accessToken).not.toBeNull();
        expect(response.body.refreshToken).not.toBeNull();

        accessToken = response.body.accessToken;
        console.log(accessToken);

    });

    test("Missed access token header - It should respond with an 401 request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({
                name: "",
                mac: "",
                type: ""
            });
        expect(response.statusCode).toBe(401);
    });

    test("Invalid access token value - It should respond with an 401 request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({
                name: "",
                mac: "",
                type: ""
            })
            .set("x-token", "dfdfdf4i45i45");
        expect(response.statusCode).toBe(401);
    });

    test("Empty Request's body - It should respond with a bad request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({})
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Params are empty - It should respond with a bad request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({
                name: "",
                mac: "",
                type: ""
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Invalid device Type - It should respond with an bad request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({
                name: "myDevice",
                mac: "74:69:69:2D:30:02",
                type: "7"
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Device Created - It should respond the new refresh token & access token", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({
                name: "myDevice1245",
                mac: "74:69:69:2D:30:08",
                type: 1
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body.msg).toBe("success");
        expect(response.body.device).not.toBeNull();
    });
});

describe("DB Disconnection", () => {
    test("It should return true if database is disconnected successfully", async () => {
        const disconnected = await disconnectDB();
        expect(disconnected).toBeTruthy();
    });
});