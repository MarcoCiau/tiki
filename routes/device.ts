import { Router, Request, Response } from "express";
import * as deviceController from "../controllers/device";
import * as authValidator from '../middlewares/auth.validator';
import * as deviceValidator from '../middlewares/device.validator';
const router = Router();

router.get('/', authValidator.validateJWT, deviceValidator.getAllRules(), deviceValidator.result, deviceController.getDevices);
router.get('/:id', authValidator.validateJWT, deviceValidator.mongoIdRule(), deviceValidator.result, deviceController.getDevice);
router.post('/', authValidator.validateJWT, deviceValidator.createRules(), deviceValidator.result, deviceController.createDevice);
router.put('/:id', authValidator.validateJWT, deviceValidator.updateRules(), deviceValidator.result, deviceController.updateDevice);
router.delete('/:id', authValidator.validateJWT, deviceValidator.mongoIdRule(), deviceValidator.result, deviceController.deleteDevice);

export default router;