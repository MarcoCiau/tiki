import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import CustomAPIError from '../errors/CustomAPIError';
const errorHandlerMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction) => {
    const defaultError = {
        statusCode: (err instanceof CustomAPIError) ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
        msg: (err instanceof CustomAPIError) ? err.message : 'Something went wrong, try again later',
        moreInfo: (err instanceof CustomAPIError) ? err.moreInfo : [],
    }
    res.status(defaultError.statusCode).json({ msg: defaultError.msg, moreInfo: defaultError.moreInfo })
}

export default errorHandlerMiddleware;
