import { body, CustomValidator, param, validationResult, Result } from 'express-validator';
import { Request, Response } from 'express';
import { deviceType } from '../util/read.types';
import { BadRequestError } from '../errors';

let validateDeviceType: CustomValidator = value => {
    return (value === deviceType.singlePhase || value === deviceType.threePhase);
}

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
                .custom(validateDeviceType)
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
            body('token')
                .trim()
                .isLength({ min: 64, max: 64 })
                .optional(),
            body('name')
                .exists()
                .notEmpty()
                .trim()
                .optional(),
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
                .custom(validateDeviceType)
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
        throw new BadRequestError("Please provide valid values", errors.array());
    }
    next();
};
