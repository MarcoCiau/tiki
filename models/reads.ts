import { Schema, model, Types } from "mongoose";
import { sensorType, unitType } from "../util/read.types";

interface sensorData {
    _id: Types.ObjectId,
    type: sensorType,
    value: number,
    unit: unitType
}

interface Reads {
    deviceId: Types.ObjectId,
    timestamp: Date,
    metadata: sensorData[]
}

const readSchema: Schema<Reads> = new Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Devices"
    },
    timestamp: {
        type: Date
    },
    metadata: [new Schema<sensorData>({
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
    })]
});


readSchema.methods.toJSON = function () {
    const { __v, ...reads } = this.toObject();
    return reads;
}

const ReadsModel = model<Reads>('Reads', readSchema);

export default ReadsModel;