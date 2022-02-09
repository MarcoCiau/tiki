import { Schema, model, Types } from "mongoose";

interface sensorData {
    _id: Types.ObjectId,
    type: string,
    value: number,
    unit: string
}

interface Reads {
    deviceId: Types.ObjectId,
    timestamp: Date,
    metadata: sensorData
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
    metadata: new Schema<sensorData>({
        type: {
            type: String,
            enum: ['SINGLE_PHASE','THREE_PHASE'],
            default : 'SINGLE_PHASE',
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['A','V','KwH', 'N/A'],
            default : 'N/A',
            required: true
        }
    })
});


readSchema.methods.toJSON = function () {
    const { __v, ...reads } = this.toObject();
    return reads;
}

const ReadsModel = model<Reads>('Reads', readSchema);

export default ReadsModel;