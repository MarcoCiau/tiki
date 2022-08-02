import {  Types } from "mongoose";
import { sensorType, unitType } from "../util/read.types";


export interface SensorData {
    _id: Types.ObjectId,
    type: sensorType,
    value: number,
    unit: unitType
}

export interface Reads {
    deviceId: Types.ObjectId,
    timestamp: Date,
    metadata: SensorData[]
}

export interface ReadsHistoric {
    deviceId: Types.ObjectId,
    timestamp: Date,
    type: sensorType,
    value: number,
    unit: unitType
}

interface sensorDataset {
    timestamp: Date | number,
    value: number,
}

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