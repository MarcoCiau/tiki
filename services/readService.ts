import cron from "node-cron";
import DeviceModel from "../models/device";
import ReadsModel from "../models/reads";


const executeHourTask = async () => {
    try {
        console.log(`[cron-job] - Hour Tasks...`);
        const devices = await DeviceModel.find();
        return Promise.all(devices.map(async (device) => {
            let avgReads = await ReadsModel.aggregate([
                {$unwind: '$metadata'},
                { $match: { deviceId: device._id } },
                { $group: { _id: {deviceId: "$deviceId", sensorType: "$metadata.type"}, avg: { $avg: "$metadata.value" } } }
            ])
            Promise.resolve(avgReads);
        }))
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
