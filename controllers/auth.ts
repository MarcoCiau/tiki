import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import UserModel from '../models/user';
import RefreshTokenModel from '../models/refreshToken';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../util/auth.util';
import { BadRequestError, UnauthenticatedError } from '../errors';
const generateTokens = async (userId: string) => {
    try {
        /* Generate Refresh & Access Tokens */
        const [refreshToken, accessToken] = await Promise.all([generateRefreshToken(userId), generateAccessToken(userId)]);
        /* Check if current refresh token exists */
        const refreshTokenExists = await RefreshTokenModel.findOne({ user: userId });
        if (refreshTokenExists) refreshTokenExists.deleteOne();
        /* Create & Save new Refresh Token */
        const refreshTokenDoc = new RefreshTokenModel({
            user: userId,
            refreshToken: refreshToken
        });
        const newRefreshToken = await refreshTokenDoc.save();
        return Promise.resolve([accessToken, newRefreshToken.refreshToken]);
    } catch (error) {
        return Promise.reject("Generating Tokens failed");
    }
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    try {
        /* Verify User */
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            throw new BadRequestError("Email already in use");
        }
        /* Hash Password */
        const hashedPassword: string = await hashPassword(password);
        /* Create & Save New User */
        const userDoc = new UserModel({
            name,
            email,
            password: hashedPassword
        });
        const result = await userDoc.save();
        /* Generate Refresh & Access Tokens */
        const [accessToken, refreshToken] = await generateTokens(userDoc._id);
        /* Send Response */
        res.status(StatusCodes.CREATED).json({ msg: 'success', user: result, accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
}

export const signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        /* Verify User */
        const userExists = await UserModel.findOne({ email });
        if (!userExists) {
            throw new BadRequestError("Invalid Credentials");
        }
        /* Validate Password */
        const isValidPassword = await userExists.comparePassword(password);
        if (!isValidPassword) {
            throw new UnauthenticatedError("Invalid Credentials");
        }
        /* Generate Refresh & Access Tokens */
        const [accessToken, refreshToken] = await generateTokens(userExists._id);
        /* Send Response */
        res.status(StatusCodes.OK).json({ msg: 'success', user: userExists, accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const body = req.body;
        const { userId } = res.locals.jwtPayload;
        /* Verify and update User */
        const result = await UserModel.findOneAndUpdate({ _id: userId }, { ...body }, { new: true });
        if (!result) {
            throw new BadRequestError("Invalid Credentials");
        }
        res.status(StatusCodes.OK).json({ msg: 'success', user: result });
    } catch (error) {
        next(error);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    /*
    - check if token exists
    - compare plain token with hashed
    - verify access token : todo
    - create new access & refresh token
    */
    try {
        const { refreshToken } = req.body;
        /* Verify Refresh Token */
        const validToken: any = await verifyRefreshToken(refreshToken);
        const { userId } = validToken;
        /* Check if current refresh token exists */
        const refreshTokenExists = await RefreshTokenModel.findOne({ user: userId, refreshToken });
        if (!refreshTokenExists) {
            throw new BadRequestError("Authentication Invalid", ["Invalid JWT Token"]);
        }
        refreshTokenExists.deleteOne();
        /* Generate Refresh & Access Tokens */
        const [newRefreshToken, accessToken] = await Promise.all([generateRefreshToken(userId), generateAccessToken(userId)]);
        /* Create & Save new Refresh Token */
        const refreshTokenDoc = new RefreshTokenModel({
            user: userId,
            refreshToken: newRefreshToken
        });
        const result = await (await refreshTokenDoc.save()).populate('user', 'name');
        /* Send Response */
        res.status(StatusCodes.OK).json({ status: true, msg: "success", accessToken, user: result.user, refreshToken: result.refreshToken });
    } catch (error) {
        next(error);
    }
}