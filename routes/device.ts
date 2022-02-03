import { Router, Request, Response } from "express";
import * as deviceController from "../controllers/device";
import * as authValidator from '../middlewares/auth.validator';
const router = Router();

// router.get('/', authValidator.validateJWT, (req: Request, res: Response) => {
//     console.log(res.locals);
//     console.log(res.locals.jwtPayload);
//     res.status(200).json({ msg: 'Hello World' });
// });

// router.post('/', (req: Request, res: Response) => {
//     console.log(req.body);
//     res.status(200).json({ msg: 'OK' });
// });

router.get('/', authValidator.validateJWT, deviceController.getDevices);
router.get('/:id', authValidator.validateJWT, deviceController.getDevice);
router.post('/', authValidator.validateJWT, deviceController.createDevice);
router.put('/:id', authValidator.validateJWT, deviceController.updateClient);
router.delete('/:id', authValidator.validateJWT, deviceController.deleteClient);

export default router;