import { Router } from "express";
import * as readsController from "../controllers/reads";
import * as authValidator from '../middlewares/auth.validator';
import * as readValidator from '../middlewares/read.validator';
const router = Router();

router.get('/', authValidator.validateJWT, readValidator.getAllRules(), readValidator.result, readsController.getReads);
router.get('/:id', authValidator.validateJWT, readValidator.mongoIdRule(), readValidator.result, readsController.getRead);
router.post('/', readValidator.createRules(), readValidator.result, readsController.createRead);
router.delete('/:id', authValidator.validateJWT, readValidator.mongoIdRule(), readValidator.result, readsController.deleteRead);

export default router;