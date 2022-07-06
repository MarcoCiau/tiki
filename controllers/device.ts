import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import DeviceModel from '../models/device';
import UserModel from '../models/user';
import { generateDeviceToken } from '../util/auth.util';
import { NotFoundError } from '../errors';

export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await DeviceModel.find();
        res.status(StatusCodes.OK).json({ msg: 'success', devices: result });
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