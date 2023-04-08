import { Types } from 'mongoose';
import ReadsModel from '../models/reads';
import DeviceModel from '../models/device';
import { aggregateReads } from '../util/db.queries';
import { sensorType } from '../util/read.types';
import { Reads, readsGetObj } from '../util/readModel.types';
import { NotFoundError } from '../errors';

export interface getReadResponse {
    msg: string,
    read: Reads,
}

export interface getAllReadsResponse {
    msg: string,
    reads: readsGetObj,
}

export interface createReadResponse {
    msg: string,
    read?: Reads
}

class ReadService {
    async getAll(deviceId: Types.ObjectId): Promise <getAllReadsResponse> {
        try {
            // let idToSearch = new mongoose.Types.ObjectId(deviceId);
            const reads: readsGetObj = {
                deviceId
            }

            const [current, voltage, activeKwh, frequencyTS, activePower, pf] = await Promise.all([
                aggregateReads(deviceId, sensorType.curr1),
                aggregateReads(deviceId, sensorType.volt1),
                aggregateReads(deviceId, sensorType.totalKwh),
                aggregateReads(deviceId, sensorType.frequency),
                aggregateReads(deviceId, sensorType.activePower, 1),
                aggregateReads(deviceId, sensorType.powerFactor, 1),
            ])

            if (current.length === 0) {
                return Promise.resolve({ msg: 'success', reads });
            }

            if (current) {
                reads.current = current.map((sensor) => {
                    return sensor._id;
                });
                reads.lineCurrent = reads.current[0].value;
            }

            if (voltage) {
                reads.voltage = voltage.map((sensor) => {
                    return sensor._id;
                });
                reads.lineVoltage = reads.voltage[0].value;
            }

            if (activeKwh) {
                reads.activeKwh = activeKwh.map((sensor) => {
                    return sensor._id;
                });
                reads.energy = reads.activeKwh[0].value;
            }
            if (frequencyTS) {
                reads.frequencyTS = frequencyTS.map((sensor) => {
                    return sensor._id;
                });
                reads.frequency = reads.frequencyTS[0].value;
            }
            if (pf) reads.pf = pf[0]._id.value;
            if (activePower) reads.power = activePower[0]._id.value;

            /* Send Response*/
            return Promise.resolve({ msg: 'success', reads, });
        } catch (error) {
            console.log('Get all Reads failed.', error);
            return Promise.reject(error);
        }
    }

    async getOne(readId: Types.ObjectId): Promise <Reads> {
        try {
            const result = await ReadsModel.findOne({ _id: readId });
            if (!result) {
                throw new NotFoundError(`No Read with id :${readId}`);
            }
            return Promise.resolve(result);
        } catch (error) {
            console.log('Get client failed.', error);
            return Promise.reject(error);
        }
    }

    async createOne(token: string, newRead: Partial<Reads>): Promise <createReadResponse> {
        try {
            const { timestamp, metadata } = newRead;
            const sensorEpochtime = Number(timestamp) || 0;
            const deviceExists = await DeviceModel.findOne({ token });
            if (!deviceExists) {
                throw new NotFoundError(`No Device with token :${token}`);
            }
            const readDocument = new ReadsModel({
                deviceId: deviceExists._id,
                timestamp: (sensorEpochtime === 0 ? Date.now() : new Date(sensorEpochtime * 1000)),
                metadata
            });
            //update device status
            deviceExists.connected = true;
            deviceExists.lastConnected = new Date();
            deviceExists.lastReport = new Date();
            // save reads and update device
            await Promise.all([readDocument.save(), deviceExists.save()]);
            return Promise.resolve({ msg: 'success' });
        } catch (error) {
            console.log('Create Device failed.', error);
            return Promise.reject(error);
        }
    }

    async deleteOne(readId: Types.ObjectId): Promise <getReadResponse> {
        try {
            const result = await ReadsModel.findByIdAndDelete({ _id: readId });
            if (!result) {
                throw new NotFoundError(`No Read with id :${readId}`);
            }
            return Promise.resolve({ msg: 'success', read: result });
        } catch (error) {
            console.log('Delete Read failed.', error);
            return Promise.reject(error);
        }
    }
}

export default new ReadService();
