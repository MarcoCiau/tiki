import server from "../server/server"
import { Reads } from "../util/readModel.types";
import { readsGetObj } from "../util/readModel.types";
export const reportData = (payload: Reads) => {
    
    const reads :readsGetObj = {
        deviceId: payload.deviceId,
        timestamp: payload.timestamp,
        pf: payload.metadata[4].value,
        frequency: payload.metadata[5].value,
        power: payload.metadata[3].value,
        energy: payload.metadata[2].value,
        lineVoltage: payload.metadata[1].value,
        lineCurrent: payload.metadata[0].value,
    }
    const socket = server.getSocketServer();
    console.log(`emit: ${payload.deviceId}`);
    
    socket.sockets.in(`${payload.deviceId}`).emit("deviceSensors", JSON.stringify(reads));
}