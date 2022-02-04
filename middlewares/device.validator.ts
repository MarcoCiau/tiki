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
                .trim(),
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
export const result = (req: Request, res: Response, next: any) => {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
