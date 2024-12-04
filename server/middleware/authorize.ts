import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.js';

export const authorize = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //console.log("req.user: ", req.user);
    //console.log("role: ", role);
    if (req.user && (req.user as any).role === role) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
};

