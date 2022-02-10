import { body, param, query, validationResult, Result, CustomValidator, checkSchema, Schema } from 'express-validator';
import { Request, Response } from 'express';
import { sensorType, unitType } from '../util/read.types';

const isValidTimestamp: CustomValidator = value => {
    return (new Date(value * 1000)).getTime() > 0;
}

let validateSensorType: CustomValidator = value => {
    return (Object.values(sensorType).includes(value))
}

let validateUnitType: CustomValidator = value => {
    return (Object.values(unitType).includes(value))
}

let validateSortValue: CustomValidator = value => {
    return (Number(value) === -1 || Number(value) === 1)
}

let validateQueryString: CustomValidator = value => {
    return (typeof JSON.parse(value) === 'object');
}

export const getAllRules = () => {
    return (
        [
            query('from')
                .notEmpty()
                .isInt()
                .isLength({ min: 0 })
                .optional(),
            query('limit')
                .notEmpty()
                .isInt()
                .isLength({ min: 1 })
                .optional(),
            query('sort')
                .isInt()
                .custom(validateSortValue)
                .optional(),
            query('query')
                .custom(validateQueryString)
                .optional()
        ]
    )
};

export const createRules = () => {
    return (
        [
            body('token')
                .isLength({ min: 64, max: 64 }),
            body('timestamp')
                .custom(isValidTimestamp),
            body('metadata')
                .notEmpty()
                .isObject(),
            body('metadata.type')
                .custom(validateSensorType),
            body('metadata.value')
                .notEmpty()
                .isNumeric(),
            body('metadata.unit')
                .custom(validateUnitType),
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
                .optional({ checkFalsy: true })
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
