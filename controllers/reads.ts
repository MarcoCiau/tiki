import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import ReadsModel from '../models/reads';
import DeviceModel from '../models/device';
import { executeReadsQuery } from '../util/db.queries';
import { BadRequestError, NotFoundError } from '../errors';

export const getReads = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { query = "", from = 0, limit = 5, sort = 1 } = req.query;
        const reads: any = await executeReadsQuery(query.toString(), Number(from), Number(limit), Number(sort));
        if (!reads) {
            throw new BadRequestError("Get Reads by pagination failed.")
        }
        res.status(StatusCodes.OK).json({ msg: 'success', count: reads.length, reads });
    } catch (error) {
        console.log('Get all Reads failed.', error);
        next(error);
    }
}

export const getRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await ReadsModel.findOne({ _id: id });
        if (!result) {
            throw new NotFoundError(`No Read with id :${id}`);
        }
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Get client failed.', error);
        next(error);
    }
}

export const createRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, timestamp, metadata } = req.body;
        const deviceExists = await DeviceModel.findOne({ token });
        if (!deviceExists) {
            throw new NotFoundError(`No Device with token :${token}`);
        }
        const readDocument = new ReadsModel({
            deviceId: deviceExists._id,
            timestamp: (timestamp === 0 ? Date.now() : new Date(timestamp * 1000)),
            metadata
        });
        //update device status
        deviceExists.connected = true;
        deviceExists.lastConnected = new Date();
        deviceExists.lastReport = new Date();
        // save reads and update device
        await Promise.all([readDocument.save(), deviceExists.save()]);
        res.status(StatusCodes.OK).json({ msg: 'success'});
    } catch (error) {
        console.log('Create Device failed.', error);
        next(error);
    }
}

export const deleteRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await ReadsModel.findByIdAndDelete({ _id: id });
        if (!result) {
            throw new NotFoundError(`No Read with id :${id}`);
        }
        res.status(StatusCodes.OK).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Delete Read failed.', error);
        next(error);
    }
}