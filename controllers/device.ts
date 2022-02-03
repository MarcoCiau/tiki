import { Request, Response } from 'express';
import DeviceModel from '../models/device';

export const getDevices = async (req: Request, res: Response) => {
    res.status(200).json({ msg: 'success - get devices'});
    // try {
    //     const result = await DeviceModel.find();
    //     res.status(200).json({ msg: 'success', devices: result });
    // } catch (error) {
    //     console.log('Get all Devices failed.', error);
    //     res.status(500).json({ msg: 'something went wrong.' })
    // }
}

export const getDevice = async (req: Request, res: Response) => {
    res.status(200).json({ msg: 'success - get device'});

    // try {
    //     const { id } = req.params;
    //     const result = await DeviceModel.findOne({ _id: id });
    //     if (!result) {
    //         return res.status(400).json({ msg: 'Device doesn\'t exists' });
    //     }
    //     res.status(200).json({ msg: 'success', device: result });
    // } catch (error) {
    //     console.log('Get client failed.', error);
    //     res.status(500).json({ msg: 'something went wrong.' })
    // }
}

export const createDevice = async (req: Request, res: Response) => {

    // console.log();
    res.status(200).json({ msg: 'success - create devuce'});
    // try {
    //     const { email } = req.body;
    //     const clientExists = await DeviceModel.findOne({ email });
    //     if (clientExists) return res.status(400).json({ msg: 'Client already exists.' });
    //     const clientDocument = new ClientModel({
    //         ...req.body
    //     });
    //     const result = await clientDocument.save();
    //     res.status(200).json({ msg: 'success', client: result });
    // } catch (error) {
    //     console.log('Create client failed.', error);
    //     res.status(500).json({ msg: 'something went wrong.' })
    // }
}

export const updateClient = async (req: Request, res: Response) => {
    res.status(200).json({ msg: 'success - update device'});
    // try {
    //     const { id } = req.params;
    //     const body = req.body;
    //     const result = await ClientModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
    //     if (!result) {
    //         return res.status(400).json({ msg: 'Client doesn\'t exists' });
    //     }
    //     res.status(200).json({ msg: 'success', client: result });
    // } catch (error) {
    //     console.log('update client failed.', error);
    //     res.status(500).json({ msg: 'something went wrong.' });
    // }
}

export const deleteClient = async (req: Request, res: Response) => {
    res.status(200).json({ msg: 'success - delete device'});

    // try {
    //     const { id } = req.params;
    //     const result = await ClientModel.findByIdAndDelete({ _id: id });
    //     if (!result) {
    //         return res.status(400).json({ msg: 'Client doesn\'t exists' });
    //     }
    //     res.status(200).json({ msg: 'success', client: result });
    // } catch (error) {
    //     console.log('Delete client failed.', error);
    //     res.status(500).json({ msg: 'something went wrong.' });
    // }
}