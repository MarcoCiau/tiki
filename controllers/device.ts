import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import DeviceModel from '../models/device';
import UserModel from '../models/user';
import { generateDeviceToken } from '../util/auth.util';
import { NotFoundError } from '../errors';
import { Types } from 'mongoose';
interface deviceQueryObj {
    userId : Types.ObjectId,
    name?: unknown,
    connected?: boolean
};
export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = res.locals.jwtPayload;
        console.log(req.query);
        
        const { status, search, sort } = req.query;
        //setup query
        
        let deviceQuery: deviceQueryObj = {
            userId,
        }

        if (status && status == "connected")
        {
          deviceQuery.connected = true;
        }
        if (status && status == "disconnected")
        {
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit; //10
        result = result.skip(skip).limit(limit);
        // execute query and count docs
        const [devices, totalDevices] = await Promise.all([result, DeviceModel.countDocuments(deviceQuery)]);
        const numOfPages = Math.ceil(totalDevices / limit);

        res.status(StatusCodes.OK).json({msg: 'success', devices, totalDevices, numOfPages});
    } catch (error) {
        console.log('Get all Devices failed.', error);
        next(error);
    }
}

export const getDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await DeviceModel.findOne({ _id: id });
        if (!result) {
            throw new NotFoundError(`No User with id :${id}`);
        }
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Get device failed.', error);
        next(error);
    }
}

export const createDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, mac } = req.body;
        const { userId } = res.locals.jwtPayload;
        const clientExists = await UserModel.findOne({ _id: userId });
        if (!clientExists) {
            throw new NotFoundError(`No User with id :${userId}`);
        }
        const deviceToken = await generateDeviceToken(32);
        const deviceDocument = new DeviceModel({
            userId,
            token: deviceToken,
            name: name,
            mac
        });
        const result = await deviceDocument.save();
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Create Device failed.', error);
        next(error);
    }
}

export const updateDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const result = await DeviceModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
        if (!result) {
            throw new NotFoundError(`No device with id :${id}`);
        }
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('update device failed.', error);
        next(error);
    }
}

export const deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await DeviceModel.findByIdAndDelete({ _id: id });
        if (!result) {
            throw new NotFoundError(`No device with id :${id}`);
        }
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Delete Device failed.', error);
        next(error);
    }
}