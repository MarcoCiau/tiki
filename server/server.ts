import express, { Application } from 'express';
import helmet from 'helmet';
import envConfig from '../config/config';
import connectDB from '../config/db';
import cors from 'cors';
import authRoutes from '../routes/auth';
import deviceRoutes from '../routes/device';
import readsRoutes from '../routes/reads';
import initDeviceService from '../services/deviceService';
class Server {
    private app: Application;
    private port: string;
    constructor() {
        this.app = express();
        this.port = envConfig.SERVER_PORT || '8000';
        this.middlewares();
        this.routes();
        this.notFoundMiddleware();
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

    }

    notFoundMiddleware() {
        /* 404 Not-found middleware */
        this.app.use((req, res, next) => {
            res.status(404).send("Protected/Not found resource!")
        })
    }

    routes() {
        this.app.use('/api/v1/auth', authRoutes);
        this.app.use('/api/v1/device', deviceRoutes);
        this.app.use('/api/v1/read', readsRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }

    async init() {
        try {
            await connectDB();
            console.log('DB Connected!');
            this.listen();
            initDeviceService();
        } catch (error) {
            console.log('Init Server Failed : ', error);
        }
    }
}

export default Server;