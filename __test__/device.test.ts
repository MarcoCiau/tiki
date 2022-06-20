import request from "../config/testConfig";
import {connectDB, disconnectDB } from "../config/db";
const authURLBase : string = "/api/v1/device";

beforeAll(() => jest.setTimeout(90 * 1000));

describe("DB Connection", () => {
    test("It should return true if database is connected successfully", async () => {
        const db = await connectDB();
        expect(db).toBeTruthy();
    });
});


describe("DB Disconnection", () => {
    test("It should return true if database is disconnected successfully", async () => {
        const disconnected = await disconnectDB();
        expect(disconnected).toBeTruthy();
    });
});