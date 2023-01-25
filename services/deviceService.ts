import cron from "node-cron";
import { Types } from 'mongoose';
import DeviceModel, { Device } from "../models/device";
import UserModel from "../models/user";
import { BadRequestError, NotFoundError } from '../errors';
import { generateDeviceToken } from '../util/auth.util';

export interface deviceQueryParams {
    status: string,
    search: string,
    sort: string,
    page: number,
    limit: number
};

export interface deviceQueryObj {
    userId: Types.ObjectId,
    name?: unknown,
    connected?: boolean
};

export interface singleDeviceResponse {
    device: Device,
    msg: string,
}

export interface paginationDevicesResponse {
    devices: Device[],
    totalDevices: number,
    numOfPages: number,
    msg: string
}

class deviceService {
    private cronServiceRun: boolean = false;

    async updateDevicesConnectionStatus() {
        try {
            console.log(`[cron-job] - setting devices connection status...`);
            await DeviceModel.updateMany({ connected: true, lastConnected: { $lt: new Date() } }, { connected: false });
        } catch (error) {
            console.log(`[cron-job] - setting devices status failed. ${error}`);
        }
    }

    async init() {
        if (this.cronServiceRun) return;
        /* update device connection status each minute */
        cron.schedule('* * * * *', async () => {
            await this.updateDevicesConnectionStatus();
        });
        this.cronServiceRun = true;
    }

    async getDeviceById(deviceId: Types.ObjectId): Promise<singleDeviceResponse> {
        try {
            const result = await DeviceModel.findOne({ _id: deviceId });
            if (!result) {
                throw new NotFoundError(`No User with id :${deviceId}`);

            }
            return Promise.resolve({ msg: 'success', device: result });
        } catch (error) {
            console.log('Get device failed.', error);
            return Promise.reject(error);
        }
    }

    async getDevices(userId: Types.ObjectId, query: deviceQueryParams): Promise<paginationDevicesResponse> {
        try {
            //setup query
            const { status="", search, sort } = query;
            let deviceQuery: deviceQueryObj = {
                userId,
            }

            if (status == "connected") {
                deviceQuery.connected = true;
            }
            if (status == "disconnected") {
                deviceQuery.connected = false;
            }
            if (search) {
                deviceQuery.name = { $regex: search, $options: 'i' }
            }

            let result = DeviceModel.find(deviceQuery);

            // chain sort conditions
            if (sort && sort === 'latest') {
                result = result.sort('-createdAt')
            }
            if (sort && sort === 'oldest') {
                result = result.sort('createdAt')
            }
            if (sort && sort === 'a-z') {
                result = result.sort('name')
            }
            if (sort && sort === 'z-a') {
                result = result.sort('-name')
            }
            // setup pagination
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const skip = (page - 1) * limit; //10
            result = result.skip(skip).limit(limit);
            // execute query and count docs
            const [devices, totalDevices] = await Promise.all([result, DeviceModel.countDocuments(deviceQuery)]);
            const numOfPages = Math.ceil(totalDevices / limit);
            return Promise.resolve({ msg: 'success', devices, totalDevices, numOfPages });
        } catch (error) {
            console.log('Get all Devices failed.', error);
            return Promise.reject(error);
        }
    }

    async createDevice(userId: Types.ObjectId, device: Partial<Device>): Promise<singleDeviceResponse> {
        try {
            const clientExists = await UserModel.findOne({ _id: userId });
            if (!clientExists) {
                throw new NotFoundError(`No User with id :${userId}`);
            }
            const deviceToken = await generateDeviceToken(32);
            const deviceDocument = new DeviceModel({
                userId,
                token: deviceToken,
                ...device
            });
            const result = await deviceDocument.save();
            return Promise.resolve({ msg: 'success', device: result });
        } catch (error) {
            console.log('Create Device failed.', error);
            return Promise.reject(error);
        }
    }

    async updateDevice(deviceId: Types.ObjectId, device: Partial<Device>): Promise<singleDeviceResponse> {
        try {
            if (Object.keys(device).length == 0)
            {
                throw new BadRequestError(`Trouble in body request payload`);
            }
            const result = await DeviceModel.findOneAndUpdate({ _id: deviceId }, { ...device }, { new: true });
            if (!result) {
                throw new NotFoundError(`No device with id :${deviceId}`);
            }
            return Promise.resolve({ msg: 'success', device: result });
        } catch (error) {
            console.log('update device failed.', error);
            return Promise.reject(error);
        }
    }

    async deleteDevice(deviceId: Types.ObjectId): Promise<singleDeviceResponse> {
        try {
            const result = await DeviceModel.findByIdAndDelete({ _id: deviceId });
            if (!result) {
                throw new NotFoundError(`No device with id :${deviceId}`);
            }
            return Promise.resolve({ msg: 'success', device: result });
        } catch (error) {
            console.log('Delete Device failed.', error);
            return Promise.reject(error);
        }
    }
}

export default new deviceService();
