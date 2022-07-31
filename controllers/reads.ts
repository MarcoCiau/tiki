import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StatusCodes } from "http-status-codes";
import ReadsModel from '../models/reads';
import DeviceModel from '../models/device';
import { aggregateReads } from '../util/db.queries';
import {  NotFoundError } from '../errors';
import { Types } from 'mongoose';
import { sensorType } from '../util/read.types';
import { reportData } from '../services/socketService';
import { readsGetObj } from '../util/readModel.types';
// interface sensorDataset {
//     timestamp: Date | number,
//     value: number,
// }
// interface readsGetObj {
//     deviceId: Types.ObjectId,
//     pf?: number,
//     frequency?: number,
//     power?: number,
//     energy?: number,
//     lineVoltage?: number,
//     lineCurrent?: number,
//     current?: sensorDataset[],
//     voltage?: sensorDataset[],
//     activeKwh?: sensorDataset[],
//     frequencyTS?: sensorDataset[]
// }

export const getReads = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { type, deviceId } = req.query;//TODO: handle stats type
        let idToSearch = new mongoose.Types.ObjectId(deviceId as string);

        const reads :readsGetObj = {
            deviceId: idToSearch
        }

        const [current, voltage, activeKwh, frequencyTS, activePower, pf] = await Promise.all([
             aggregateReads(idToSearch, sensorType.curr1 ),
             aggregateReads(idToSearch, sensorType.volt1 ),
             aggregateReads(idToSearch, sensorType.totalKwh ),
             aggregateReads(idToSearch, sensorType.frequency ),
             aggregateReads(idToSearch, sensorType.activePower, 1 ),
             aggregateReads(idToSearch, sensorType.powerFactor, 1 ),
        ])

        if (current.length === 0)
        {
            return res.status(StatusCodes.OK).json({ msg: 'success', reads: {},  });
        }

        console.log(activePower);
        console.log(pf);
        if (current)
        {
            reads.current = current.map((sensor) => {
                return sensor._id;
            });
            reads.lineCurrent = reads.current[0].value;
        }

        if (voltage)
        {
            reads.voltage = voltage.map((sensor) => {
                return sensor._id;
            });
            reads.lineVoltage = reads.voltage[0].value;
        }

        if (activeKwh)
        {
            reads.activeKwh = activeKwh.map((sensor) => {
                return sensor._id;
            });
            reads.energy= reads.activeKwh[0].value;
        }
        if (frequencyTS)
        {
            reads.frequencyTS = frequencyTS.map((sensor) => {
                return sensor._id;
            });
            reads.frequency= reads.frequencyTS[0].value;
        }
        if (pf) reads.pf= pf[0]._id.value;
        if (activePower)reads.power= activePower[0]._id.value;
        
        /* Send Response*/
        res.status(StatusCodes.OK).json({ msg: 'success', reads,  });
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
        // report data using socket.io
        reportData(req.body);
        res.status(StatusCodes.OK).json({ msg: 'success' });
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