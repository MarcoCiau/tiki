import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from "http-status-codes";
import { reportData } from '../services/socketService';
import ReadService from '../services/readService';
import { isValidObjectId } from 'mongoose';
export const getReads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { deviceId } = req.query;//TODO: handle sensor type
        let idToSearch = new mongoose.Types.ObjectId(deviceId as string);
        if (!isValidObjectId(idToSearch))
        {
            return res.status(StatusCodes.BAD_REQUEST).json({msg: `Invalid deviceId `});
        }
        const reads = await ReadService.getAll(idToSearch);
        if (!reads)
        {
            return res.status(StatusCodes.NOT_FOUND).json({msg: `Not Reads found with deviceId: ${req.params.id}`});
        }
        /* Send Response*/
        res.status(StatusCodes.OK).json(reads);
    } catch (error) {
        console.log('Get all Reads failed.', error);
        next(error);
    }
}

export const getRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let readId = new mongoose.Types.ObjectId(id as string);
        const read = await ReadService.getOne(readId);
        res.status(StatusCodes.OK).json({ msg: 'success', read });
    } catch (error) {
        console.log('Get client failed.', error);
        next(error);
    }
}

export const createRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { deviceId, token, timestamp, metadata } = req.body;
        await ReadService.createOne(token as string, { timestamp, metadata });
        // report data using socket.io
        reportData({ deviceId, token, timestamp, metadata });
        res.status(StatusCodes.CREATED).json({ msg: 'success' });
    } catch (error) {
        console.log('Create Device failed.', error);
        next(error);
    }
}


export const deleteRead = async (req: Request, res: Response, next: NextFunction) =>  {
    try {
        const { id } = req.params;
        let readId = new mongoose.Types.ObjectId(id as string);
        const device = await ReadService.deleteOne(readId);
        res.status(StatusCodes.OK).json(device);
    } catch (error) {
        console.log('Delete Read failed.', error);
        next(error);
    }
}