import { Schema, model, Types } from "mongoose";
import { sensorType } from "../interfaces/reads";

interface Sensor {
    deviceId: Types.ObjectId,
    name: string,
    type: sensorType
}

const sensorSchema: Schema<Sensor> = new Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Devices"
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: sensorType.curr1,
        required: true,
    },
});

sensorSchema.methods.toJSON = function () {
    const { __v, ...sensor } = this.toObject();
    return sensor;
}

const SensorsModel = model<Sensor>("Sensors", sensorSchema);
export default SensorsModel;