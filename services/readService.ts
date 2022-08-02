import cron from "node-cron";
import DeviceModel from "../models/device";
import ReadsModel from "../models/reads";
class ReadService {
    private serviceInitialized: boolean;
    constructor(){
        this.serviceInitialized = false;
    }

    init() {
        if (this.serviceInitialized) return null;
        this.serviceInitialized = true;
        cron.schedule('*/1 * * * *', async () => {
            await this.updateDevicesConnectionStatus();
        });
    }

    async updateDevicesConnectionStatus () {
        try {
            console.log(`[cron-job] - setting devices connection status...`);
            await DeviceModel.updateMany({ connected: true, lastConnected: { $lt: new Date() } }, { connected: false });
        } catch (error) {
            console.log(`[cron-job] - setting devices status failed. ${error}`);
        }
    }
}

const readService = new ReadService();
export default readService;
