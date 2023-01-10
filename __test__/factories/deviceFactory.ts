import deviceService from "../../services/deviceService";
import { Types } from 'mongoose';
import { deviceType } from "../../util/read.types";

const decToHex  = (val : Number) => {
    let hexStr = val.toString(16);
    if (hexStr.length < 2) {
        hexStr = `0${hexStr}`;
    }
    return hexStr;
}

const createDevice = (userId: Types.ObjectId, idx: Number) => {
    return deviceService.createDevice(userId, {
        name: `testDevice${idx}`,
        type: deviceType.singlePhase,
        mac: `FF:FF:FF:FF:FF:${decToHex(idx)}`
    });
}

export const bulkCreateDevices =  (userId: Types.ObjectId  ) => {
    const promises = [];
    // const userObjId = new Types.ObjectId(userId);
    for (let index = 0; index < 20; index++) {
        promises.push(createDevice(userId, index));
    }
    return Promise.all(promises);
} 