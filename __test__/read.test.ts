import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
import DeviceModel, { Device } from "../models/device";
import UserModel from "../models/user";
import { deviceType } from "../util/read.types";
import { signupUser } from "./factories/authFactory";
import { createDevice } from "./factories/deviceFactory";
import { userData } from "./factories/authFactory";
import { buildReadRequestPayload, bulkCreateReads } from "./factories/readFactory";
import { now, Types } from "mongoose";
import { singleDeviceResponse } from "../services/deviceService";

import {Reads, SensorData} from "../util/readModel.types";
import ReadsModel from "../models/reads";

const readURLBase: string =   "/api/v1/read";

let accessToken: string = "*";
let deviceAccessToken : string = "*";
let userId: Types.ObjectId;
let deviceId: Types.ObjectId;
//data 
let newReadPayload = {} //TODO: define create read response

describe("Creating a new Read - Test ", () => {

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
        //create a test user and grab their id & access token
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const query = await UserModel.findOne({ email: userData.email });
        userId = query?._id;
        // create a test device and grab their access token
        const device : singleDeviceResponse = await createDevice(userId, 0);
        deviceAccessToken = device.device.token;
        deviceId = device.device._id;
        newReadPayload = buildReadRequestPayload(deviceAccessToken);
    })

    test("Empty Request's body - It should respond with a bad request", async () => {
        const response = await request
            .post(readURLBase)
            .send({})
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Params are empty - It should respond with a bad request", async () => {
        const response = await request
            .post(readURLBase)
            .send({
                token: "",
                timestamp: "",
                metadata: ""
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Bad Timestamp format - It should respond with a bad request", async () => {
        const response = await request
            .post(readURLBase)
            .send({...newReadPayload, timestamp: "Wednesday, April 5, 2023"})
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Device Created - It should respond with a 201 Code ", async () => {
        const response = await request
            .post(readURLBase)
            .send({...newReadPayload, token: deviceAccessToken, deviceId})
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(201);
    });
});

describe("Test get one read by Id", ()=> {
    let readIdStr: string = "dfdfrtg";
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
        await UserModel.deleteMany();
        await DeviceModel.deleteMany();
        await ReadsModel.deleteMany();
        //create a test user and grab their id & access token
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const query = await UserModel.findOne({ email: userData.email });
        userId = query?._id;
        // create a test device and grab their access token
        const device : singleDeviceResponse = await createDevice(userId, 0);
        deviceAccessToken = device.device.token;
        deviceId = device.device._id;
        await bulkCreateReads(deviceAccessToken);
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("Missed access token header - It should respond with an 400 request", async () => {
        const response = await request
            .get(`${readURLBase}/${readIdStr}`)
            // .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Invalid access token value - It should respond with an 400 request", async () => {
        const response = await request
            .get(`${readURLBase}/${readIdStr}`)
            .set("x-token", "dfdfdf4i45i45");
        expect(response.statusCode).toBe(400);
    });

    test("Read Id is not provided, should return 400", async () => {
        const response = await request
            .get(`${readURLBase}/`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Read Id is wrong, random string , should return 400", async () => {
        const response = await request
            .get(`${readURLBase}/${"dfrgrmao5h"}`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Get Read with correct Id, should return 200", async () => {
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .get(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Get Read with correct Id, should return a 'successs' msg key value", async () => {
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .get(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.body.msg).toBe('success');
    })
    
    test("Get Read with correct Id, should return a read value", async () => {
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .get(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.body.read).not.toBeUndefined();
    })
});

describe ("Test get all Reads", () => {    
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
        await UserModel.deleteMany();
        await DeviceModel.deleteMany();
        // await ReadsModel.deleteMany();
        //create a test user and grab their id & access token
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const query = await UserModel.findOne({ email: userData.email });
        userId = query?._id;
        // create a test device and grab their access token
        const device : singleDeviceResponse = await createDevice(userId, 0);
        deviceAccessToken = device.device.token;
        deviceId = device.device._id;
        await ReadsModel.deleteMany({deviceId});
        await bulkCreateReads(deviceAccessToken);
    })

    afterAll(async () => {
        await disconnectDB();
    });

    // Cleans up database between each test
    // afterEach(async () => {
    //     await UserModel.deleteMany();
    //     await DeviceModel.deleteMany();
    //     // await ReadsModel.deleteMany();
    //     //create a test user and grab their id & access token
    //     const auth = await signupUser();
    //     accessToken = auth.body.accessToken;
    //     const query = await UserModel.findOne({ email: userData.email });
    //     userId = query?._id;
    //     // create a test device and grab their access token
    //     const device : singleDeviceResponse = await createDevice(userId, 0);
    //     deviceAccessToken = device.device.token;
    //     deviceId = device.device._id;
    //     await ReadsModel.deleteMany({deviceId});
    //     await bulkCreateReads(deviceAccessToken);
    // })

    test("Create 20 READS for testing- It should return a device array length equal to 20", async () => {
        await ReadsModel.deleteMany({deviceId});
        await bulkCreateReads(deviceAccessToken);
        const reads = await ReadsModel.find({deviceId});
        expect(reads.length).toBe(20);
    });

    test("Get Reads with missed deviceId in query param, should return 400", async () => {
        const response = await request        
        .get(`${readURLBase}`)
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Get Reads with wrong device Id in query param, should return 400", async () => {
        const response = await request        
        .get(`${readURLBase}?deviceId=${0}`)
        .set("x-token", accessToken);
        console.log(response.body);
        
        expect(response.statusCode).toBe(400);
    });

    test("Get Reads with correct device Id in query param, should return 200", async () => {
        const response = await request        
        .get(`${readURLBase}?deviceId=${deviceId}`)
        .set("x-token", accessToken);
        console.log(response.body);
        expect(response.statusCode).toBe(200);
    });
})

describe("Delete Read By Id - Test ", () => {
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
        await UserModel.deleteMany();
        await DeviceModel.deleteMany();
        await ReadsModel.deleteMany();
        //create a test user and grab their id & access token
        const auth = await signupUser();
        accessToken = auth.body.accessToken;
        const query = await UserModel.findOne({ email: userData.email });
        userId = query?._id;
        // create a test device and grab their access token
        const device : singleDeviceResponse = await createDevice(userId, 0);
        deviceAccessToken = device.device.token;
        deviceId = device.device._id;
        await bulkCreateReads(deviceAccessToken);
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("ReadId is not provided, should return 404-Not Found", async () => {
        const response = await request
            .delete(`${readURLBase}/`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });
    
    test("ReadId is not match with a valid Read, should return 404-Not Found", async () => {
        const response = await request
            .delete(`${readURLBase}/${"63ce8d5a482f3478c17391ff"}`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });

    test("Delete Read with correct Id, should return 200", async () => {
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .delete(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Delete Read with correct Id, should return a 'successs' msg key value", async () => {
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .delete(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.body.msg).toBe('success');
    })

    test("Delete Read with correct Id, should return a read value", async () => {
        await ReadsModel.deleteMany({deviceId});
        await bulkCreateReads(deviceAccessToken);
        const read = await ReadsModel.findOne({ deviceId });
        const response = await request        
        .delete(`${readURLBase}/${read?._id}`)
        .set("x-token", accessToken);
        expect(response.body.read).not.toBeUndefined();
    })

});