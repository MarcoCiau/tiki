import { Request, Response } from 'express';
import DeviceModel from '../models/device';
import UserModel from '../models/user';
import { generateDeviceToken } from '../util/auth.util';

export const getDevices = async (req: Request, res: Response) => {
    try {
        const result = await DeviceModel.find();
        res.status(200).json({ msg: 'success', devices: result });
    } catch (error) {
        console.log('Get all Devices failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const getDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await DeviceModel.findOne({ _id: id });
        if (!result) {
            return res.status(400).json({ msg: 'Device doesn\'t exists' });
        }
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Get client failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const createDevice = async (req: Request, res: Response) => {
    try {
        const {name, mac} = req.body;
        const {userId} = res.locals.jwtPayload;
        const clientExists = await UserModel.findOne({ _id: userId });
        if (!clientExists) return res.status(400).json({ msg: 'User id doesn\'t exists.' });
        const deviceToken = await generateDeviceToken(32);
        const deviceDocument = new DeviceModel({
            userId,
            token: deviceToken,
            name : name,
            mac
        });
        const result = await deviceDocument.save();
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Create Device failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const updateDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;
        
        const result = await DeviceModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
        if (!result) {
            return res.status(400).json({ msg: 'Device doesn\'t exists' });
        }
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('update device failed.', error);
        res.status(500).json({ msg: 'something went wrong.' });
    }
}

export const deleteDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await DeviceModel.findByIdAndDelete({ _id: id });
        if (!result) {
            return res.status(400).json({ msg: 'Device doesn\'t exists' });
        }
        res.status(200).json({ msg: 'success', device: result });
    } catch (error) {
        console.log('Delete Device failed.', error);
        res.status(500).json({ msg: 'something went wrong.' });
    }
}