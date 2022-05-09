import { Request, Response } from 'express';
import UserModel from '../models/user';
import RefreshTokenModel from '../models/refreshToken';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../util/auth.util';

export const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        /* Verify User */
        const userExists = await UserModel.findOne({ email });
        if (userExists) return res.status(400).json({ msg: 'User already exists.' });
        /* Hash Password */
        const hashedPassword: string = await hashPassword(password);
        /* Create & Save New User */
        const userDoc = new UserModel({
            email,
            password: hashedPassword
        });
        const result = await userDoc.save();     
        /* Send Response */       
        res.status(200).json({ msg: 'success', user: result });
    } catch (error) {
        console.log('Signing up user failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        /* Verify User */
        const userExists = await UserModel.findOne({ email });
        if (!userExists) return res.status(400).json({ msg: 'User Doesn\'t exists or the email is invalid.' });
        /* Validate Password */
        const isValidPassword = await userExists.comparePassword(password);
        if (!isValidPassword) {
            return res.status(400).json({ msg: 'Invalid Password.' });
        }
        /* Generate Refresh & Access Tokens */
        const [refreshToken, accessToken] = await Promise.all([generateRefreshToken(userExists._id), generateAccessToken(userExists._id)]);
        /* Check if current refresh token exists */
        const refreshTokenExists = await RefreshTokenModel.findOne({user: userExists._id});
        if (refreshTokenExists) refreshTokenExists.deleteOne();
        /* Create & Save new Refresh Token */
        const refreshTokenDoc = new RefreshTokenModel({
            user: userExists._id,
            refreshToken: refreshToken
        });
        const newRefreshToken = await refreshTokenDoc.save();  
        /* Send Response */      
        res.status(200).json({ msg: 'success', user: userExists, accessToken, refreshToken:newRefreshToken.refreshToken });
    } catch (error) {
        console.log('Signing in user failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}

export const refreshToken = async (req: Request, res: Response) => {
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
        if (!validToken) return res.status(400).json({ status: false, msg: "expired token" });
        const { userId } = validToken;
        /* Check if current refresh token exists */
        const refreshTokenExists = await RefreshTokenModel.findOne({ user: userId, refreshToken });
        if (!refreshTokenExists) return res.status(400).json({ status: false, msg: "invalid toen" });
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
        res.status(200).json({ status: true, msg: "success", accessToken, user: result.user, refreshToken: result.refreshToken });
    } catch (err: any) {
        console.log('reset refresh token failed.', err);
        res.status(400).json({ status: false, msg: err.message });
    }
}