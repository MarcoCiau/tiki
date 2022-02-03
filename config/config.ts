import dotenv from "dotenv";
dotenv.config();
export default {
    NODE_ENV: process.env.ENV,
    SERVER_PORT : process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DB_URL: process.env.MONGODB_SRV,
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY || '1234567890ABCDEFGHIJK',
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY || '1234567890ABCDEFGHIJK',
    CLIENT_URL: process.env.CLIENT_URL || 'localhost'
};