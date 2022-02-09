import { Router } from "express";
// import * as deviceController from "../controllers/device";
import * as readsController from "../controllers/reads";
import * as authValidator from '../middlewares/auth.validator';
import * as deviceValidator from '../middlewares/device.validator';
const router = Router();

router.get('/', authValidator.validateJWT, readsController.getReads);
router.get('/:id', authValidator.validateJWT, readsController.getRead);
router.post('/', authValidator.validateJWT, readsController.createRead);
router.put('/:id', authValidator.validateJWT, deviceValidator.result, readsController.updateRead);
router.delete('/:id', authValidator.validateJWT, readsController.deleteRead);

export default router;