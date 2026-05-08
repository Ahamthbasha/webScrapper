import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError'; 
import AuthService from '../services/authService'; 
// Helper function for consistent cookie options
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge,
});

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const result = await this.authService.initiateRegistration({ name, email, password });

      // Set registration token in HTTP-only cookie
      res.cookie('registrationToken', result.registrationToken, getCookieOptions(10 * 60 * 1000)); // 10 minutes

      res.status(200).json({
        success: true,
        message: 'Registration initiated. Please check your email for OTP.',
        data: {
          email: result.email,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * STEP 2: Verify OTP and complete registration
   */
  verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const registrationToken = req.cookies?.registrationToken;

      if (!registrationToken) {
        throw new AppError('Registration session expired. Please register again.', 400);
      }

      const result = await this.authService.verifyOTPAndCompleteRegistration(
        { email, otp },
        registrationToken
      );

      // Clear registration token cookie - MUST match the settings used when setting it
      res.clearCookie('registrationToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend OTP
   */
  resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const result = await this.authService.resendOTP(email);

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully. Please check your email.',
        data: {
          email,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });

      // Set auth tokens in HTTP-only cookies
      res.cookie('accessToken', result.tokens.accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear all auth cookies with proper options
      const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
      };

      res.clearCookie('accessToken', clearOptions);
      res.clearCookie('refreshToken', clearOptions);
      res.clearCookie('registrationToken', clearOptions);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };


}

export default AuthController;