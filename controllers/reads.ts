import { Request, Response } from 'express';
import ReadsModel from '../models/reads';
import DeviceModel from '../models/device';
import { executeReadsQuery } from '../util/db.queries';

export const getReads = async (req: Request, res: Response) => {

    try {
        const { query = "", from = 0, limit = 5, sort = 1 } = req.query;
        const reads: any = await executeReadsQuery(query.toString(), Number(from), Number(limit), Number(sort));
        if (!reads) {
            res.status(400).json({ msg: 'Get all Reads failed.', })
        }
        res.json({ msg: 'success', count: reads.length, reads });
    } catch (error) {
        console.log('Get all Reads failed.', error);
        res.status(500).json({ msg: 'something went wrong.', error })
    }
}

export const getRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await ReadsModel.findOne({ _id: id });
        if (!result) {
            return res.status(400).json({ msg: 'Read doesn\'t exists' });
        }
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Get client failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const createRead = async (req: Request, res: Response) => {
    try {
        const { token, timestamp, metadata } = req.body;
        const deviceExists = await DeviceModel.findOne({ token });
        if (!deviceExists) {
            return res.status(400).json({ msg: 'Device doesn\'t exists.' });
        }
        const readDocument = new ReadsModel({
            deviceId: deviceExists._id,
            timestamp: new Date(timestamp * 1000),
            metadata
        });
        const result = await readDocument.save();
        res.status(200).json({ msg: 'success', read: result });
    } catch (error) {
        console.log('Create Device failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const deleteRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await ReadsModel.findByIdAndDelete({ _id: id });
        if (!result) {
            return res.status(400).json({ msg: 'Read doesn\'t exists' });
        }
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Delete Read failed.', error);
        res.status(500).json({ msg: 'something went wrong.' });
    }
}