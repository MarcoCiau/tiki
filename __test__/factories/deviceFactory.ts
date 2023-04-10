import deviceService from "../../services/deviceService";
import { Types } from 'mongoose';
import { deviceType } from "../../interfaces/reads";;

const decToHex  = (val : Number) => {
    let hexStr = val.toString(16);
    if (hexStr.length < 2) {
        hexStr = `0${hexStr}`;
    }
    return hexStr;
}

const generateRandomLetter = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz"
    return alphabet[Math.floor(Math.random() * alphabet.length)]
}

export const createDevice = (userId: Types.ObjectId, idx: Number) => {
    // generate random letter Id, just for sorting tests
    const charId = generateRandomLetter();
    return deviceService.createDevice(userId, {
        name: `${charId}testDevice${idx}`,
        type: deviceType.singlePhase,
        mac: `FF:FF:FF:FF:FF:${decToHex(idx)}`,
        connected: (idx < 10) ? true : false
    });
}

export const bulkCreateDevices =  (userId: Types.ObjectId  ) => {
    const promises = [];
    for (let index = 0; index < 20; index++) {
        promises.push(createDevice(userId, index));
    }
    return Promise.all(promises);
} 