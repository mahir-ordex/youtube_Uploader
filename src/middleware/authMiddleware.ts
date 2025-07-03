import JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel'; 


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
                ...user.toObject(),    
                _id: user._id.toString(),
            };
            console.log("User with ID as string: form middleware ::::", userWithIdAsString);
            req.user = userWithIdAsString;
            next();

    } catch (error) {
        console.error('Error in authMiddleware:', error);

        res.status(401).json({ message: 'Unauthorized' });
        return;  
    }
}

const roleMiddleware = (roles: string[]): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role?: string };
    if (!user || !roles.includes(user.role || "")) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};

export { authMiddleware, roleMiddleware };