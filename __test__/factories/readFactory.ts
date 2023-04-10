
import readService from "../../services/readService";
import { Read, sensorType, unitType } from "../../interfaces/reads";

export const buildReadRequestPayload = (deviceToken: string): Read => {
    return {
        token: deviceToken,
        timestamp: Date.now(),
        metadata: [
            {
                type: sensorType.curr1,
                value: 254,
                unit: unitType.current
            },
            {
                type: sensorType.volt1,
                value: 22550,
                unit: unitType.voltage
            },
            {
                type: sensorType.totalKwh,
                value: 16588,
                unit: unitType.kwh
            },
            {
                type: sensorType.activePower,
                value: 16588,
                unit: unitType.kw
            },
            {
                type: sensorType.powerFactor,
                value: 16588,
                unit: unitType.none
            },
            {
                type: sensorType.frequency,
                value: 16588,
                unit: unitType.frequency
            }

        ]
    }
}

export const createRead = (token: string, read: Partial<Read>) => {
    return readService.createOne(token, read);
}

export const bulkCreateReads =  (token: string) => {
    const promises = [];
    for (let index = 0; index < 20; index++) {
        promises.push(createRead(token, buildReadRequestPayload(token)));
    }
    return Promise.all(promises);
} 