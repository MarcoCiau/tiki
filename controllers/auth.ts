import { Request, Response } from 'express';
import UserModel from '../models/user';
import { hashPassword, generateAccessToken } from '../util/auth.util';

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
        /* Generate Access Token */
        const accessToken = await generateAccessToken(userExists._id);
        /* Send Response */      
        res.status(200).json({ msg: 'success', user: userExists, accessToken });
    } catch (error) {
        console.log('Signing in user failed.', error);
        res.status(500).json({ msg: 'something went wrong.' })
    }
}
