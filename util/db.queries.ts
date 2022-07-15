import ReadsModel from "../models/reads";
import { Types } from 'mongoose';
import { sensorType } from "./read.types";

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

export const aggregateReads = async (device: Types.ObjectId, sensor: sensorType, minDate: Date, maxDate:Date) => {
    return await ReadsModel.aggregate([
        { $unwind: "$metadata" },
        { $match: { $and: [{ "deviceId": device }, { "metadata.type": sensor }] } },
        // { $match: { $and: [{ "deviceId": device }, { "metadata.type": sensor }, { timestamp: { $gte: new Date('2022-07-15T23:49:50.000Z'), $lte: new Date('2022-07-15T23:59:50.000Z') } }] } },
        { $limit : 120 },
        { $sort: {timestamp: -1}},
        {
            $group: {
                _id: { timestamp: "$timestamp",value: "$metadata.value" },
            },
        },
    ])
}