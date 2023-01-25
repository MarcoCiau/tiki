import { body, query, CustomValidator, param, validationResult, Result } from 'express-validator';
import { Request, Response } from 'express';
import { deviceType } from '../util/read.types';
import { BadRequestError } from '../errors';
import { deviceConnectionStatus, deviceSortOptions } from '../util/device.quety.types';

let validateDeviceType: CustomValidator = value => {
    return (value === deviceType.singlePhase || value === deviceType.threePhase);
}

let validateConnectionStatusType: CustomValidator = value => {
    return (value === deviceConnectionStatus.disconnected || value === deviceConnectionStatus.connected);
}

let validateDeviceSortingType: CustomValidator = value => {
    return Object.values(deviceSortOptions).includes(value);
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
                .notEmpty()
                .isMongoId(),
        ]
    )
};

export const updateRules = () => {
    return (
        [
            param('id')
                .isMongoId(),
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

export const getAllRules = () => {
    return (
        [
            query('page')
                .notEmpty()
                .isNumeric()
                .isLength({ min: 1 })
                .optional(),
            query('limit')
                .notEmpty()
                .isInt()
                .isLength({ min: 1 })
                .optional(),
            query('status')
                .custom(validateConnectionStatusType)
                .optional(),
            query('sort')
                .custom(validateDeviceSortingType)
                .optional(),
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
