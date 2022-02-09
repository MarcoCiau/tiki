import { Router } from "express";
import * as readsController from "../controllers/reads";
import * as authValidator from '../middlewares/auth.validator';
import * as readValidator from '../middlewares/read.validator';
const router = Router();

router.get('/', authValidator.validateJWT, readValidator.getAllRules(), readValidator.result, readsController.getReads);
router.get('/:id', authValidator.validateJWT, readValidator.mongoIdRule(), readValidator.result, readsController.getRead);
router.post('/', authValidator.validateJWT, readValidator.createRules(), readValidator.result, readsController.createRead);
router.put('/:id', authValidator.validateJWT, readValidator.result, readsController.updateRead);
router.delete('/:id', authValidator.validateJWT, readsController.deleteRead);

export default router;