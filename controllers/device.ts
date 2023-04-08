import { Request, Response, NextFunction } from 'express';
import deviceService, { deviceQueryParams } from '../services/deviceService';
import { StatusCodes } from "http-status-codes";
import { Types } from 'mongoose';

export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // build request query obj
        const { status = "", search = "", sort = "" } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        let queryParams: deviceQueryParams = {
            status: status as string,
            search: search as string,
            sort: sort as string,
            page,
            limit
        }
        //grab user id
        const { userId } = res.locals.jwtPayload;
        //get all devices
        const result = await deviceService.getDevices(userId, queryParams);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        console.log('Get all Devices failed.', error);
        next(error);
    }
}

export const getDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deviceId = new Types.ObjectId(req.params.id);
        const result = await deviceService.getDeviceById(deviceId);
        if (!result)
        {
            return res.status(StatusCodes.NOT_FOUND).json({msg: `Not device found with id: ${req.params.id}`});
        }
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        console.log('Get device failed.', error);
        next(error);
    }
}

export const createDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, type, mac } = req.body;
        const { userId } = res.locals.jwtPayload;
        const result = await deviceService.createDevice(userId, { name, type, mac });
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        console.log('Create Device failed.', error);
        next(error);
    }
}

export const updateDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const deviceId = new Types.ObjectId(req.params.id);
        const result = await deviceService.updateDevice(deviceId, { ...body });
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        console.log('update device failed.', error);
        next(error);
    }
}

export const deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deviceId = new Types.ObjectId(req.params.id);
        const result = await deviceService.deleteDevice(deviceId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        console.log('Delete Device failed.', error);
        next(error);
    }
}