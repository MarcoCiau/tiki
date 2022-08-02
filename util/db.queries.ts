import ReadsModel from "../models/reads";
import { Types } from 'mongoose';
import { sensorType } from "./read.types";
import ReadsHistoricModel from "../models/readHistoric";

export const executeReadsQuery = (query: string, from: number = 0, limit: number = 5, sort: number = 1) => {
    return new Promise((resolve, reject) => {
        let queryObj: object = {};
        if (query === "") {
            reject({ error: "invalid query object" });
        }
        queryObj = { ...JSON.parse(query) };
        ReadsModel.find(queryObj)
            .skip(from)
            .limit(limit)
            .sort({ timestamp: sort })
            .exec(function (err, reads) {
                if (err) {
                    console.log("Error while querying reads collection!");
                    reject(err);
                };
                resolve(reads);
            });

    });
}

export const aggregateReads = async (device: Types.ObjectId, sensor: sensorType, limit: number = 50) => {
    return await ReadsModel.aggregate([
        { $unwind: "$metadata" },
        { $match: { $and: [{ "deviceId": device }, { "metadata.type": sensor }] } },
        {
            $group: {_id: {timestamp: "$timestamp",value: "$metadata.value"}},
        },
        { $sort : { "_id.timestamp" : -1 } },
        { $limit : limit },
    ])
}

export const minuteAverageReads = async (interval:number) => {
    const now = new Date();
    const start: Date | number = new Date(now.valueOf() - (1 * interval));
    const end: Date | number = new Date(now.valueOf() - (2 * interval));
    console.log(start);
    console.log(end);
    
    const res = await ReadsModel.aggregate([
        { $unwind: "$metadata" },
        { $match: { "timestamp": { $gte: end, $lte: start } } },
        {
            $group: { _id: { deviceId: "$deviceId", type: "$metadata.type", unit: "$metadata.unit" }, value: { $avg: "$metadata.value" } } ,
        },
    ])
    return Promise.all(res.map(async (read) => {
        const readHistoric = new ReadsHistoricModel({
            deviceId: read._id.deviceId,
            timestamp: start,
            type : read._id.type,
            value : read.value,
            unit: read._id.unit
        });
        const result = await readHistoric.save();
        if (!result) return  Promise.resolve(false);
        Promise.resolve(true);
    }));
    // console.log(res);
}
/*
 try {
        console.log(`[cron-job] - Hour Tasks...`);
        const devices = await DeviceModel.find();
        if (devices.length === 0) return null;
        return Promise.all(devices.map(async (device) => {
            let avgReads = await ReadsModel.aggregate([
                {$unwind: '$metadata'},
                { $match: { deviceId: device._id } },
                { $group: { _id: {deviceId: "$deviceId", sensorType: "$metadata.type"}, avg: { $avg: "$metadata.value" } } }
            ])
            Promise.resolve(avgReads);
        }))
*/