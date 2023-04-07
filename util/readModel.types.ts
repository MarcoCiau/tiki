import {  Types } from "mongoose";
import { sensorType, unitType } from "../util/read.types";


export interface SensorData {
    _id?: Types.ObjectId,
    type: sensorType,
    value: number,
    unit: unitType
}

/// define sensor dataset for creating new entry
export interface Reads {
    deviceId?: Types.ObjectId,
    token: string,
    timestamp: Date | number,
    metadata: SensorData[]
}


interface sensorDataset {
    timestamp: Date | number,
    value: number,
}

//get reads obj response
export interface readsGetObj {
    deviceId: Types.ObjectId,
    timestamp?: Date | number,
    pf?: number,
    frequency?: number,
    power?: number,
    energy?: number,
    lineVoltage?: number,
    lineCurrent?: number,
    current?: sensorDataset[],
    voltage?: sensorDataset[],
    activeKwh?: sensorDataset[],
    frequencyTS?: sensorDataset[]
}