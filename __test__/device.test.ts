import request from "../config/testConfig";
import { connectDB, disconnectDB } from "../config/db";
import DeviceModel, { Device } from "../models/device";
import UserModel from "../models/user";
import { deviceType } from "../interfaces/reads";;
import { signupUser } from "./factories/authFactory";
import { bulkCreateDevices } from "./factories/deviceFactory";
import { userData } from "./factories/authFactory";
import { Types } from "mongoose";
//params
const deviceURLBase: string = "/api/v1/device";
let accessToken: string = "*";
let userId: Types.ObjectId;
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

    test("Empty MAC string - It should respond with an bad request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({ ...newDevice, mac: "" })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Invalid MAC string Format - It should respond with an bad request", async () => {
        const response = await request
            .post(deviceURLBase)
            .send({ ...newDevice, mac: "GJ:01:F5:4D:01:00" })
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

describe ("Test getDevices with pagination, limit, filter and sort", () => {    
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

    //testing 'status' query param

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

        //testing 'sort' query param
    test("Test getAllDevices with 'sort' query param as empty - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort:""
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test getAllDevices with 'sort' query param as a number - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: 1
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });
    test("Test getAllDevices with wrong 'sort' string  param - it should respond a bad request", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: "ascendent"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test getAllDevices with 'sort' param equal to 'oldest' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: "oldest"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'sort' param equal to 'latest' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: "latest"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'sort' param equal to 'a-z' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: "a-z"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test getAllDevices with 'sort' param equal to 'z-a' - it should respond with 200 status code", async () => {
        const response = await request
            .get(deviceURLBase)
            .query({
                page: 1,
                sort: "z-a"
            })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });
})

//
describe("Get Device By Id - Test ", () => {
    let deviceIdStr: string = "dfdfrtg";
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("Device Id is not provided, should return 200", async () => {
        const response = await request
            .get(`${deviceURLBase}/`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Device Id is wrong, random string , should return 400", async () => {
        const response = await request
            .get(`${deviceURLBase}/${deviceIdStr}`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Get Device with correct Id, should return 200", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .get(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Get Device with correct Id, should return a 'successs' msg key value", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .get(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.body.msg).toBe('success');
    })

    test("Get Device with correct Id, should return a device value", async () => {
        const device = await DeviceModel.findOne({ userId });
        console.log(device);
        
        const response = await request        
        .get(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.body.device).not.toBeUndefined();
    })
});

describe("Update device By Id - Test ", () => {
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("DeviceId is not provided, should return 404-Not Found", async () => {
        const response = await request
            .put(`${deviceURLBase}/`)
            .send({
                connected: true
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });
    
    test("DeviceId is not match with a valid device, should return 404-Not Found", async () => {
        const response = await request
            .put(`${deviceURLBase}/${"63ce8d5a482f3478c17391ff"}`)
            .send({
                connected: true
            })
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });

    test("Update Device with correct Id but body is empty, should return 400", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({})
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    })

    test("Update Device with with invalid 'type' value, should return 400", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            connected: "connected"
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    })

    test("Update Device with with invalid 'connection' status value, should return 400", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            type: "single-phase"
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    })

    test("Update Device with with empty 'MAC' value, should return 400", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            mac: ""
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    })

    test("Update Device with with invalid 'MAC' value, should return 400", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            mac: "GG:GG:GG:GG:GG:GG"
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(400);
    })

    test("Update Device with with a valid 'MAC' value, should return 200", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            mac: "F7:D1:62:BB:FD:0B"
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Update Device with correct Id and correct body object, should return 200", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            ...device,
            name: `${device?.name}Updated`,
            connected: true
        })
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Update Device with correct Id and correct body object, should return a 'successs' msg key value", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            ...device,
            name: `${device?.name}Updated`,
            connected: true
        })
        .set("x-token", accessToken);
        expect(response.body.msg).toBe('success');
    })

    test("Update Device with correct Id and correct body object, should return a device value", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            ...device,
            name: `${device?.name}Updated`,
            connected: true
        })
        .set("x-token", accessToken);
        expect(response.body.device).not.toBeUndefined();
    })

    test("Update Device with correct Id and correct body object, should return an updated device's name", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .put(`${deviceURLBase}/${device?._id}`)
        .send({
            ...device,
            name: `${device?.name}Updated`,
            connected: true
        })
        .set("x-token", accessToken);
        expect(response.body.device.name).toBe(`${device?.name}Updated`);
    })
});

describe("Delete device By Id - Test ", () => {
    beforeAll(async () => {
        jest.setTimeout(100 * 1000);
        await connectDB();
    })

    afterAll(async () => {
        await disconnectDB();
    });

    test("DeviceId is not provided, should return 404-Not Found", async () => {
        const response = await request
            .delete(`${deviceURLBase}/`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });
    
    test("DeviceId is not match with a valid device, should return 404-Not Found", async () => {
        const response = await request
            .delete(`${deviceURLBase}/${"63ce8d5a482f3478c17391ff"}`)
            .set("x-token", accessToken);
        expect(response.statusCode).toBe(404);
    });

    test("Get Device with correct Id, should return 200", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .delete(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.statusCode).toBe(200);
    })

    test("Delete Device with correct Id, should return a 'successs' msg key value", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .delete(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.body.msg).toBe('success');
    })

    test("Delete Device with correct Id, should return a device value", async () => {
        const device = await DeviceModel.findOne({ userId });
        const response = await request        
        .delete(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        expect(response.body.device).not.toBeUndefined();
    })

    test("Delete Device with correct Id, should not be available on DB", async () => {
        const device = await DeviceModel.findOne({ userId });
        await request        
        .delete(`${deviceURLBase}/${device?._id}`)
        .set("x-token", accessToken);
        const deviceIsAvailable = await DeviceModel.findOne({ _id: device?._id});
        expect(deviceIsAvailable).toBeNull;
    })
});