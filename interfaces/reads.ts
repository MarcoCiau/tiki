import {  Types } from "mongoose";

export  enum sensorType {
    curr1 = "CURRENT_A",
    curr2 = "CURRENT_B",
    curr3 = "CURRENT_C",
    volt1 = "VOLT_A",
    volt2 = "VOLT_B",
    volt3 = "VOLT_C",
    totalKwh = "TOTAL_ACTIVE_KWH",
    activePower = "ACTIVE_POWER",
    powerFactor = "POWER_FACTOR",
    frequency = "FREQUENCY",
    none = "NA"
}

export enum  deviceType {
    singlePhase = 1,
    threePhase
}

export  enum unitType {
    current = "A",
    voltage = "V",
    kwh = "kwh",
    kw = "kw",
    frequency = "Hz",
    none = "NA"
}


export interface SensorData {
    _id?: Types.ObjectId,
    type: sensorType,
    value: number,
    unit: unitType
}

/// define sensor dataset for creating new entry
export interface Read {
    deviceId?: Types.ObjectId,
    token: string,
    timestamp: Date | number,
    metadata: SensorData[]
}

export interface sensorDataset {
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

export interface aggregateReadsObj {
    _id: sensorDataset
}