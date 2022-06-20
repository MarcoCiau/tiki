import cron from "node-cron";
import DeviceModel from "../models/device";
import ReadsModel from "../models/reads";
import ReadPerDayModel from "../models/readPerDay";

const runAggregation = async (): Promise<any> => {
    const devices = await DeviceModel.find();
    return Promise.all(devices.map(async (device) => {
        let avgReads = await ReadsModel.aggregate([
            { $unwind: '$metadata' },
            { $match: { deviceId: device._id } },
            { $group: { _id: { deviceId: "$deviceId", type: "$metadata.type", unit: "$metadata.unit" }, value: { $avg: "$metadata.value" } } },
        ])
        const reads: any[] = avgReads.map( (read) => {
            const { _id: {deviceId, type, unit}, value } = read;
            return {deviceId, type, unit, value};
        })
        const res = await ReadPerDayModel.insertMany([...reads]);
        Promise.resolve(res);
    }))
}

const executeHourTask = async () => {
    try {
        console.log(`[cron-job] - Hour Tasks...`);
        await runAggregation();
    } catch (error) {
        console.log(`[cron-job] - Hour Tasks failed. ${error}`);
    }
}

const initReadService = () => {
    cron.schedule('10 * * * * *', () => {
        executeHourTask();
    });
}

export default initReadService;
