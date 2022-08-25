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

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthSucess: 
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description : user email
 *         password:
 *           type: string
 *           description : user password, must be grether or equal to 8 characters
 *       example:
 *           email: user@email.com
 *           password: secret_key
 */


router.post('/signup', limiter, authValidator.rules(), authValidator.result, authController.signup);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and login
 */

/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: Login
 */

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login to the application
 *     tags: [Login]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *               password:
 *                 type: string
 *                 required: true
 *             example:
 *               email: email@mail.com
 *               password: secret_key
 *     responses:
 *       200:
 *         description: user login success
 *         schema:
 *           type: object
 *           $ref: '#/components/schemas/AuthSucess'
 */
router.post('/signin', limiter, authValidator.signinRules(), authValidator.result, authController.signin);
router.post('/refreshToken', limiter, authValidator.refreshTokendRules(), authValidator.result, authController.refreshToken);
router.patch('/user', authValidator.validateJWT, authValidator.updateRules(), authValidator.result, authController.update);
export default router;
