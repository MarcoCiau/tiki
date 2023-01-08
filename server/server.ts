import express, { Application } from 'express';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http'
import socketIO from 'socket.io'
import helmet from 'helmet';
import mongoSanatize from 'express-mongo-sanitize';
import envConfig from '../config/config';
import { connectDB } from '../config/db';
import cors from 'cors';
import errorHandlerMiddleware from '../middlewares/errorHandler';
import authRoutes from '../routes/auth';
import deviceRoutes from '../routes/device';
import readsRoutes from '../routes/reads';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../util/socket.types";
import deviceService from '../services/deviceService';

class AppServer {
    private app: Application;
    private port: string;
    private httpServer: http.Server;
    private io: socketIO.Server;
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.port = envConfig.SERVER_PORT || '4000';
        this.middlewares();
        // only when ready to deploy
        this.app.use(express.static(path.resolve(__dirname, "../build")))
        this.routes();
        // only when ready to deploy
        this.app.get('*', function (req, res) {
            res.sendFile(path.resolve(__dirname, '../build', 'index.html'))
        });
        this.notFoundMiddleware();
        this.errorHandlerMiddleware();
        this.sockets();
    }

    middlewares() {
        /* Helmet Security */
        this.app.use(helmet());
        /* enable cors */
        this.app.use(cors());
        /* parse application/json requests*/
        this.app.use(express.json());
        /* parse application/x-www-form-urlencoded requests. Only parse string or arrays*/
        this.app.use(express.urlencoded({ extended: false }));
        /* sanatizer for mogodb*/
        this.app.use(mongoSanatize());
    }

    notFoundMiddleware() {
        /* 404 Not-found middleware */
        this.app.use((req, res, next) => {
            res.status(404).send("Protected/Not found resource!")
        })
    }

    errorHandlerMiddleware() {
        /* error handler */
        this.app.use(errorHandlerMiddleware);
    }

    routes() {
        this.app.use('/api/v1/auth', authRoutes);
        this.app.use('/api/v1/device', deviceRoutes);
        this.app.use('/api/v1/read', readsRoutes);
    }

    services() {
        deviceService.init();
    }

    sockets() {
        let userIdRoom = "";
        this.io.on("connection", (socket: socketIO.Socket) => {
            console.log('client connected : ' + socket.id);
            socket.on('disconnect', function () {
                console.log('client disconnected : ' + socket.id);
            })
            // once a client has connected, we expect to get a ping from them saying what room they want to join
            socket.on('room', function (room) {
                console.log(room);

                userIdRoom = room;
                socket.join(`${room}`);
            });
        });
    }

    listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }

    getApp() {
        return this.app;
    }

    getSocketServer() {
        return this.io;
    }

    async init() {
        try {
            await connectDB();
            console.log('DB Connected!');
            this.listen();
            this.services();
        } catch (error) {
            console.log('Init Server Failed : ', error);
        }
    }
}
const server = new AppServer();
export default server;