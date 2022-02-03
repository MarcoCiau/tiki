import { Schema, model, Types} from "mongoose";

interface Device {
    userId: Types.ObjectId,
    token: string, 
    name: string,
    mac: string,
    connected: boolean,
    lastConnected: Date,
    lastDisconnected: Date
}

const deviceSchema: Schema<Device> = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },
    token: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mac: {
        type: String,
        unique: true,
        required: true
    },
    connected: {
        type: Boolean,
        default: false
    },
    lastConnected : {
        type: Date
    },
    lastDisconnected : {
        type: Date
    }
});

deviceSchema.methods.toJSON = function () {
    const { __v, ...device } = this.toObject();
    return device;
}

const DeviceModel = model<Device>('Devices', deviceSchema);

export default DeviceModel;