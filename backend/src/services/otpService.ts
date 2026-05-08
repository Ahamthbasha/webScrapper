import OTP from '../models/Otp';
import AppError from '../utils/appError';
import { EmailService } from './emailService';

export class OTPService {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendOTP(email: string): Promise<{ expiresIn: number }> {
    try {
      await OTP.deleteMany({ email });

      const otp = this.generateOTP();

      console.log('otp generated',otp)

      const expiresAt = new Date(Date.now() + 60 * 1000);

      await OTP.create({
        email,
        otp,
        expiresAt,
      });

      await this.emailService.sendOTPEmail(email, otp);

      return { expiresIn: 60 };
    } catch (error) {
      console.error('Failed to generate OTP:', error);
      throw new AppError('Failed to send OTP. Please try again.', 500);
    }
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('No OTP found. Please request a new one.', 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteMany({ email });
      throw new AppError('OTP expired. Please request a new one.', 400);
    }

    if (otpRecord.otp !== otp) {
      throw new AppError('Invalid OTP. Please try again.', 400);
    }

    await OTP.deleteMany({ email });

    return true;
  }

  async resendOTP(email: string): Promise<{ expiresIn: number }> {
    await OTP.deleteMany({ email });
    return this.generateAndSendOTP(email);
  }
}

export default OTPService;