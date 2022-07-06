import cron from "node-cron";
import DeviceModel from "../models/device";

const updateDevicesConnectionStatus = async () => {
    try {
        console.log(`[cron-job] - setting devices connection status...`);
        await DeviceModel.updateMany({ connected: true, lastConnected: { $lt: new Date() } }, { connected: false });
    } catch (error) {
        console.log(`[cron-job] - setting devices status failed. ${error}`);
    }
}

const initDeviceService = () => {
    cron.schedule('2 * * * *', () => {
        updateDevicesConnectionStatus();
    });
}

export default initDeviceService;
