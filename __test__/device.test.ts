import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
import DeviceModel, { Device } from "../models/device";
import UserModel from "../models/user";
import { deviceType } from "../util/read.types";
import { signupUser } from "./factories/authFactory";
import { bulkCreateDevices } from "./factories/deviceFactory";
import { userData } from "./factories/authFactory";
import { Types } from "mongoose";
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

describe("Test getDevices with pagination, limit, filter and sort", () => {
    let userId: Types.ObjectId;
    
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
        //clean up db
        await UserModel.deleteMany();
        await DeviceModel.deleteMany();
        //create a test user and grab their id & access token
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const query = await UserModel.findOne({ email: userData.email });
        userId = query?._id;
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("Create 20 devices for testing- It should return a device array length equal to 20", async () => {
        await bulkCreateDevices(userId);
        const devices = await DeviceModel.find({ userId });
        expect(devices.length).toBe(20);
    });

    test("Test pagination - it should response with a 200 statuscode ", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                limit: 5
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test pagination - if page and limit parameter are not defined, the reponse will be with default pagination(1 page with limit of 10 results)", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({})
            .set("x-token", accessToken);
        expect(response.body.devices.length).toBe(10);
    });

    test("Test pagination - if page and limit parameters are empty string, should a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: "",
                limit: ""
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test pagination - if page and limit parameters are random string, should a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: "sdfd",
                limit: "dfdf"
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test pagination - if limit parameter is not provided, should return 1 page with default limit of 10 results", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1
            })
            .set("x-token", accessToken);
        expect(response.body.devices.length).toBe(10);
    });

    test("Test pagination -  the response body should include a 'totalDevices' parameter with value equal to 20 (total created devices)", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1
            })
            .set("x-token", accessToken); 
        expect(response.body.totalDevices).toBe(20);
    });

    test("Test pagination - the response body should include a 'numOfPages' parameter with a default value equal to 2", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1
            })
            .set("x-token", accessToken);
        expect(response.body.numOfPages).toBe(2);
    });

    test("Test pagination - the 'numOfPages' parameter is 4 when 'limit' is set to 5", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                limit: 5
            })
            .set("x-token", accessToken);
        expect(response.body.numOfPages).toBe(4);
    });

    test("Test getAllDevices with 'status' filter param as empty - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status:""
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test getAllDevices with 'status' filter param as a number - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: 1
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test getAllDevices with wrong device connection 'status' string param - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "Connected"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - the 'totalDevices' should be equal to 10", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.body.totalDevices).toBe(10);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - the 'numOfPages' should be equal to 1", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.body.numOfPages).toBe(1);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'status' connection equal to 'disconnected' - the number of device's array  should be equal to 10", async () => {
        //let's assume we have 10 disconnected devices (previously created on 'bulkCreateDevices' function)
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.body.devices.length).toBe(10);
    });

    test("Test getAllDevices with 'status' connection equal to 'connected' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "disconnected"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'status' connection equal to 'connected' - the 'totalDevices' should be equal to 10", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "connected"
            })
        .set("x-token", accessToken);
        expect(response.body.totalDevices).toBe(10);
    });

    test("Test getAllDevices with 'status' connection equal to 'connected' - the 'numOfPages' should be equal to 1", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "connected"
            })
        .set("x-token", accessToken);
        expect(response.body.numOfPages).toBe(1);
    });


    test("Test getAllDevices with 'status' connection equal to 'connected' - the number of device's array  should be equal to 10", async () => {
        //let's assume we have 10 connected devices (previously created on 'bulkCreateDevices' function)
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                status: "connected"
            })
        .set("x-token", accessToken);
        expect(response.body.devices.length).toBe(10);
    });
})
