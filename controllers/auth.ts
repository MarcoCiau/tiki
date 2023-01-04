import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import authService from '../services/authService';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    try {
        const result = await authService.signup(name, email, password);
        /* Send Response */
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        next(error);
    }
}

export const signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        const result = await authService.signin(email, password);
        /* Send Response */
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const body = req.body;
        const { userId } = res.locals.jwtPayload;
        const result = await authService.update(body, userId);
        /* Send Response */
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        /* Send Response */
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
}