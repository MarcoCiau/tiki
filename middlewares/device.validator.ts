import { body, param, validationResult, Result } from 'express-validator';
import { Request, Response } from 'express';

export const createRules = () => {
    return (
        [
            body('name')
                .notEmpty()
                .trim(),
            body('mac')
                .notEmpty()
                .trim()
                .isLength({ min: 17, max: 17 }),
            body('type')
                .notEmpty()
                .isNumeric()
        ]
    )
};

export const mongoIdRule = () => {
    return (
        [
            param('id')
                .isMongoId(),
        ]
    )
};

export const updateRules = () => {
    return (
        [
            body('name')
                .exists()
                .notEmpty()
                .trim(),
            body('mac')
                .exists()
                .notEmpty()
                .trim()
                .isLength({ min: 17, max: 17 })
                .optional(),
            body('type')
                .exists()
                .notEmpty()
                .isNumeric()
                .optional(),
            body('connected')
                .exists()
                .notEmpty()
                .isBoolean()
                .optional({checkFalsy: true})
        ]
    )
};

export const result = (req: Request, res: Response, next: any) => {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
