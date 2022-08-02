import { Schema, model, Types } from "mongoose";
import { sensorType, unitType } from "../util/read.types";
import { ReadsHistoric } from "../util/readModel.types";
// interface sensorData {
//     _id: Types.ObjectId,
//     type: sensorType,
//     value: number,
//     unit: unitType
// }

// interface Reads {
//     deviceId: Types.ObjectId,
//     timestamp: Date,
//     metadata: sensorData[]
// }



const readHistoricSchema: Schema<ReadsHistoric> = new Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Devices",
        index: true,
    },
    timestamp: {
        type: Date,
        index: true,
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


readHistoricSchema.methods.toJSON = function () {
    const { __v, ...reads } = this.toObject();
    return reads;
}

const ReadsHistoricModel = model<ReadsHistoric>('ReadsHistoric', readHistoricSchema);

export default ReadsHistoricModel;