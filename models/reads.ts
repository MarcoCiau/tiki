import { Schema, model, Types } from "mongoose";
import { sensorType, unitType, Read, SensorData } from "../interfaces/reads";

const readSchema: Schema<Read> = new Schema({
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
    metadata: [new Schema<SensorData>({
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
},
    {
        timeseries: {
            timeField: 'timestamp',
            metaField: 'metadata',
            granularity: 'minutes'
        }
    }

);


readSchema.methods.toJSON = function () {
    const { __v, ...reads } = this.toObject();
    return reads;
}

const ReadsModel = model<Read>('Reads', readSchema);

export default ReadsModel;