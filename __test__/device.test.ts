import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
import DeviceModel, { Device } from "../models/device";
import UserModel from "../models/user";
import { deviceType } from "../util/read.types";
import { signupUser } from "./factories/authFactory";

//params
const deviceURLBase: string = "/api/v1/device";
let accessToken: string = "*";
//data 
let newDevice: Partial<Device> = {
    name: "deviceTest01",
    mac: "FF:FF:FF:FF:FF:FF",
    type: deviceType.singlePhase
}

describe("Creating a new device - Test ", () => {

    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
    })

    afterAll(async () => {
        await disconnectDB();
    });

    // Cleans up database between each test
    afterEach(async () => {
        await UserModel.deleteMany()
        await DeviceModel.deleteMany()
    })

    test("Missed access token header - It should respond with an 400 request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send(newDevice);
        expect(response.statusCode).toBe(400);
    });
    test("Invalid access token value - It should respond with an 400 request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send(newDevice)
            .set("x-token", "dfdfdf4i45i45");
        expect(response.statusCode).toBe(400);
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
            .send({ ...newDevice, type: "7" })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Device Created - It should respond the new refresh token & access token", async () => {
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const response = await request
            .post(deviceURLBase)
            .send(newDevice)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(201);
    });
});
