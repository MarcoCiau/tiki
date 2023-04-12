import { Types } from 'mongoose';
import ReadsModel from '../models/reads';
import DeviceModel from '../models/device';
import { aggregateReads, processReads } from '../util/db.queries';
import { Read, readsGetObj,sensorType, sensorDataset }  from "../interfaces/reads";
import { NotFoundError } from '../errors';

export interface getReadResponse {
    msg: string,
    read: Read,
}

export interface getAllReadsResponse {
    msg: string,
    reads: readsGetObj,
}

export interface createReadResponse {
    msg: string,
    read?: Read
}

class ReadService {
    async getAll(deviceId: Types.ObjectId): Promise <getAllReadsResponse> {
        try {
            // let idToSearch = new mongoose.Types.ObjectId(deviceId);
            const reads: readsGetObj = {
                deviceId
            }
            // Run MongoDB aggregation to search and order reads by sensor type, device and timestamp
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
            
            // Process and convert all aggregated data into a simple array
            const [currentArr, voltageArr, activeKwhArr, frequencyTSArr, activePowerArr, pfArr] = await Promise.all([
                processReads(current),
                processReads(voltage),
                processReads(activeKwh),
                processReads(frequencyTS),
                processReads(activePower),
                processReads(pf),
            ])

            reads.current = currentArr;
            reads.lineCurrent = reads.current[0].value;
        
            reads.voltage = voltageArr;
            reads.lineVoltage = reads.voltage[0].value;
        
            reads.activeKwh = activeKwhArr;
            reads.energy = reads.activeKwh[0].value;

            reads.frequencyTS = frequencyTSArr;
            reads.frequency = reads.frequencyTS[0].value;
            
            reads.pf = pfArr[0].value;
            reads.power = activePowerArr[0].value;

            /* Send Response*/
            return Promise.resolve({ msg: 'success', reads, });
        } catch (error) {
            console.log('Get all Reads failed.', error);
            return Promise.reject(error);
        }
    }

    async getOne(readId: Types.ObjectId): Promise <Read> {
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

    async createOne(token: string, newRead: Partial<Read>): Promise <createReadResponse> {
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
