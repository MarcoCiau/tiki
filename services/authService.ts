import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user';
import RefreshTokenModel from '../models/refreshToken';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../util/auth.util';
import { BadRequestError, UnauthenticatedError } from '../errors';

class authService {
    private async generateTokens(userId: string = "") {
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

    async signup(name: string = "", email: string = "", password: string = "") {
        // const { name, email, password } = req.body;
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
            const [accessToken, refreshToken] = await this.generateTokens(userDoc._id);
            return Promise.resolve({ msg: 'success', user: result, accessToken, refreshToken });
        } catch (error) {
            return Promise.reject("signup failed");
        }
    }

    async signin(email: string = "", password: string = "") {
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
            const [accessToken, refreshToken] = await this.generateTokens(userExists._id);
            /* Send Response */
            return Promise.resolve({ msg: 'success', user: userExists, accessToken, refreshToken });
        } catch (error) {
            return Promise.reject("signin failed");
        }
    }

    async update(updatedUser: any = {}, userId: string = "") {//TODO: create an interface to specify an user object contract
        try {
            /* Verify and update User */
            const result = await UserModel.findOneAndUpdate({ _id: userId }, { ...updatedUser }, { new: true });
            if (!result) {
                throw new BadRequestError("Invalid Credentials");
            }
            return Promise.resolve({ msg: 'success', user: result });
        } catch (error) {
            return Promise.reject("update user failed");
        }
    }

    async refreshToken(token: string = "") {
        /*
        - verify plain token with hashed
        - check if token exists 
        - delete existing access & refresh tokens
        - generate new access & refresh tokens
        */
        try {
            /* Verify Refresh Token */
            const validToken: any = await verifyRefreshToken(token);
            const { userId } = validToken;
            /* Check if current refresh token exists */
            const refreshTokenExists = await RefreshTokenModel.findOne({ user: userId, token });
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
            return Promise.resolve({ status: true, msg: "success", accessToken, user: result.user, refreshToken: result.refreshToken });
        } catch (error) {
            return Promise.reject("refreshToken failed");
        }
    }
}

export default new authService();