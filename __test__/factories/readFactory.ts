import { Schema, model, Types } from "mongoose";
export const buildReadRequestPayload = (deviceToken: string) => {
    return {
        token: deviceToken,
        timestamp: Date.now(),
        metadata: [
            {
                type: "CURRENT_A",
                value: 254,
                unit: "A"
            },
            {
                type: "VOLT_A",
                value: 22550,
                unit: "V"
            },
            {
                type: "TOTAL_ACTIVE_KWH",
                value: 16588,
                unit: "kwh"
            },
            {
                type: "ACTIVE_POWER",
                value: 16588,
                unit: "kw"
            },
            {
                type: "POWER_FACTOR",
                value: 16588,
                unit: "NA"
            },
            {
                type: "FREQUENCY",
                value: 16588,
                unit: "Hz"
            }

        ]
    }
}