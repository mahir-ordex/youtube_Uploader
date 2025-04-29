import JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel'; 
import { UserDocument } from '../models/userModel';


const authMiddleware = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        // console.log(req.cookies);
            const token = req.cookies.auth_token; 
            if (!token) {
                 res.status(401).json({ message: 'Unauthorized' });
                 return;
            }
            const decoded = JWT.verify(token, process.env.JWT_SECRET as string) as { id: string };
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
             res.status(401).json({ message: 'Unauthorized' });
             return;
            }
            const userWithIdAsString = {
                ...user.toObject(),    // important: convert Mongoose document to plain object
                _id: user._id.toString(), // force _id to string
            };
            // console.log("User with ID as string: form middleware ::::", userWithIdAsString);
            req.user = userWithIdAsString;
            next();

    } catch (error) {
        console.error('Error in authMiddleware:', error);

        res.status(401).json({ message: 'Unauthorized' });
        return;  
    }
}

export default authMiddleware;