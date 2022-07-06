import { body, validationResult, Result } from 'express-validator';
import { Request, Response } from 'express';
import { verifyAccessToken } from '../util/auth.util';
import { BadRequestError } from '../errors';

export const rules = () => {
    return (
        [
            body('name')
                .notEmpty()
                .isString()
                .trim(),
            body('password')
                .isLength({ min: 8 })
                .trim(),
            body('email')
                .isEmail()
                .normalizeEmail(),
            body('timezone')
                .exists()
                .isString()
                .trim()
                .optional(),
        ]
    )
};

export const signinRules = () => {
    return (
        [
            body('password')
                .isLength({ min: 8 })
                .trim(),
            body('email')
                .isEmail()
                .normalizeEmail()
        ]
    )
};

export const updateRules = () => {
    return (
        [
            body('name')
                .notEmpty()
                .isString()
                .trim(),
            body('email')
                .notEmpty()
                .isEmail()
                .normalizeEmail(),
            body('timezone')
                .notEmpty()
                .isString()
                .trim(),
        ]
    )
}

export const result = (req: Request, res: Response, next: any) => {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const refreshTokendRules = () => {
    return (
        [
            body('refreshToken')
                .notEmpty()
        ]
    )
};

export const validateJWT = async (req: Request, res: Response, next: any) => {
    try {
        let token = req.header('x-token');
        if (!token) {
            throw new BadRequestError("Authentication Invalid", ["Token is not present in the headers"]);
        }
        let jwtPayload = await verifyAccessToken(token);
        res.locals.jwtPayload = jwtPayload;
        next();
    } catch (error) {
        next(error);
    }
}