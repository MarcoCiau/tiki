import mongoose from 'mongoose';
import config from '../config/config';
const connectDB = async (): Promise<any> => {
    const mongoDBUrl: string = config.DB_URL || "";
    await mongoose.connect(mongoDBUrl);
    mongoose.connection.on('error', err => {
        return Promise.reject(err);
    });
    return Promise.resolve(true);
};

const disconnectDB = async () : Promise <any> => {
    try {
        await mongoose.disconnect();
        return Promise.resolve(true);
    } catch (error) {
        return Promise.resolve(false);
    }
}

export {connectDB, disconnectDB};