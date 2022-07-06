import { Router } from 'express';
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many requests from this IP, please try again after 15 minutes",
})
import * as authController from '../controllers/auth';
import * as authValidator from '../middlewares/auth.validator';
const router = Router();
router.post('/signup', limiter, authValidator.rules(), authValidator.result, authController.signup);
router.post('/signin', limiter, authValidator.signinRules(), authValidator.result, authController.signin);
router.post('/refreshToken', limiter, authValidator.refreshTokendRules(), authValidator.result, authController.refreshToken);
router.patch('/user', authValidator.validateJWT, authValidator.updateRules(), authValidator.result, authController.update);
export default router;
