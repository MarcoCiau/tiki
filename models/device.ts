import { Schema, model, Types} from "mongoose";
import { deviceType } from "../util/read.types";

export interface Device {
    userId: Types.ObjectId,
    token: string, 
    name: string,
    type: deviceType,
    mac: string,
    connected: boolean,
    lastConnected: Date,
    lastDisconnected: Date,
    lastReport: Date
}

const deviceSchema: Schema<Device> = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },
    token: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    mac: {
        type: String,
        required: true,
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
    },
    lastReport : {
        type: Date
    },
});

deviceSchema.methods.toJSON = function () {
    const { __v, ...device } = this.toObject();
    return device;
}

const DeviceModel = model<Device>('Devices', deviceSchema);

export default DeviceModel;