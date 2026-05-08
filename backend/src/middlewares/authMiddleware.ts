import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwtService'
import User from '../models/User'; 
import AppError from '../utils/appError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge,
});

export class AuthMiddleware {
  private readonly ADMIN_ID = '00000000-0000-0000-0000-000000000000';

  constructor(private jwtService: JwtService) {}

  authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const accessToken = req.cookies?.accessToken || req.cookies?.adminAccessToken;
      const refreshToken = req.cookies?.refreshToken || req.cookies?.adminRefreshToken;

      if (!accessToken && !refreshToken) {
        throw new AppError('No authentication tokens provided', 401);
      }

      if (accessToken) {
        try {
          const payload = this.jwtService.verifyAccessToken(accessToken);
          
          if (payload.role === 'admin' && payload.userId === this.ADMIN_ID) {
            req.user = {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
            };
            return next();
          }

          const user = await User.findById(payload.userId);
          
          if (!user || !user.isActive) {
            throw new AppError('User not found or inactive', 401);
          }

          req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          };
          
          return next();
        } catch (accessTokenError) {
        
          console.log('Access token invalid, trying refresh token...');
        }
      }

      if (refreshToken) {
        try {
          const refreshPayload = this.jwtService.verifyRefreshToken(refreshToken);
          
        
          if (refreshPayload.role === 'admin' && refreshPayload.userId === this.ADMIN_ID) {
          
            const newAccessToken = this.jwtService.generateAccessToken({
              userId: refreshPayload.userId,
              email: refreshPayload.email,
              role: refreshPayload.role,
            });

            
            res.cookie('adminAccessToken', newAccessToken, getCookieOptions(15 * 60 * 1000)); 

            req.user = {
              userId: refreshPayload.userId,
              email: refreshPayload.email,
              role: refreshPayload.role,
            };

            return next();
          }
          
          const user = await User.findById(refreshPayload.userId);
          
          if (!user || !user.isActive) {
           
            const clearOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
            };
            
            res.clearCookie('refreshToken', clearOptions);
            res.clearCookie('accessToken', clearOptions);
            res.clearCookie('adminRefreshToken', clearOptions);
            res.clearCookie('adminAccessToken', clearOptions);
            throw new AppError('User not found or inactive', 401);
          }

          const newAccessToken = this.jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

         
          res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };

          return next();
        } catch (refreshTokenError) {
          const clearOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
          };
          
          res.clearCookie('refreshToken', clearOptions);
          res.clearCookie('accessToken', clearOptions);
          res.clearCookie('adminRefreshToken', clearOptions);
          res.clearCookie('adminAccessToken', clearOptions);
          throw new AppError('Session expired. Please login again.', 401);
        }
      }

      throw new AppError('Authentication required', 401);
    } catch (error) {
      next(error);
    }
  };

  isAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      if (req.user.role !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      if (req.user.userId !== this.ADMIN_ID) {
        throw new AppError('Access denied. Invalid admin credentials.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  isUser = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      if (req.user.role !== 'user') {
        throw new AppError('Access denied. User privileges required.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default AuthMiddleware;