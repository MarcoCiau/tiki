import { Schema, model, Types } from "mongoose";
import { sensorType, unitType } from "../util/read.types";

interface ReadṔerDay {
    deviceId: Types.ObjectId,
    timestamp: Date,
    type: sensorType,
    value: number,
    unit: unitType
}

const readPerDaySchema: Schema<ReadṔerDay> = new Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Devices"
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        default: sensorType.curr1,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: unitType.current,
        required: true
    }
});

readPerDaySchema.methods.toJSON = function () {
    const { __v, ...reads } = this.toObject();
    return reads;
}

const ReadPerDayModel = model<ReadṔerDay>('ReadsPerDay', readPerDaySchema);

export default ReadPerDayModel;