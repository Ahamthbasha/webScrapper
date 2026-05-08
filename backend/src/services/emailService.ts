import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import AppError from '../utils/appError';

dotenv.config();

export interface IEmailConfig {
  user: string;
  pass: string;
  fromName?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor(config: IEmailConfig) {
    this.fromEmail = config.user;
    this.fromName = config.fromName || 'HN Story Saver';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    void this.verifyConfiguration();
  }

  private async verifyConfiguration(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service configured successfully');
    } catch (error: any) {
      console.error('❌ Invalid email configuration:', error.message);
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Email service configuration failed - invalid credentials', 500);
      }
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        to: email,
        from: `"${this.fromName}" <${this.fromEmail}>`,
        subject: 'Your OTP for Registration - HN Story Saver',
        html: this.getOTPEmailTemplate(otp),
        text: `Your OTP for registration is: ${otp}. This code is valid for 60 seconds.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Failed to send OTP email:', error.message);

      if (process.env.NODE_ENV !== 'production') {
        console.log('=================================');
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        console.log('=================================');
      } else {
        throw new AppError('Failed to send OTP email. Please try again.', 500);
      }
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const mailOptions = {
        to: email,
        from: `"${this.fromName}" <${this.fromEmail}>`,
        subject: 'Welcome to HN Story Saver! 📚',
        html: this.getWelcomeEmailTemplate(name, frontendUrl),
        text: `Welcome ${name}! Your account has been successfully verified. Login to start saving your favorite Hacker News stories: ${frontendUrl}/login`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Failed to send welcome email:', error.message);
    }
  }

  private getOTPEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #f4f6f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px 20px; text-align: center; }
          .header h2 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .otp-container { text-align: center; margin: 30px 0; }
          .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 8px; color: #d97706; background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block; font-family: monospace; }
          .warning { color: #ef4444; font-size: 14px; text-align: center; margin-top: 20px; }
          .note { color: #6b7280; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; background: #f9fafb; color: #6b7280; font-size: 12px; }
          .footer p { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Verify Your Email</h2>
            <p>HN Story Saver</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; margin-bottom: 20px;">Hello,</p>
            <p>To complete your registration and start saving your favorite Hacker News stories, use the OTP below:</p>
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="warning">⏰ This code is valid for 60 seconds only!</p>
            <p class="note">Never share this OTP with anyone. If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} HN Story Saver. Save and organize your favorite stories.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string, frontendUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #f4f6f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; }
          .header p { margin: 10px 0 0; opacity: 0.9; font-size: 18px; }
          .content { padding: 40px 30px; text-align: center; }
          .welcome-message { font-size: 18px; margin-bottom: 30px; color: #374151; }
          .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: background 0.3s; }
          .button:hover { background: #047857; }
          .features { display: flex; justify-content: center; gap: 20px; margin: 30px 0; color: #6b7280; flex-wrap: wrap; }
          .feature-item { text-align: center; font-size: 14px; }
          .feature-emoji { font-size: 32px; display: block; margin-bottom: 8px; }
          .footer { padding: 20px; text-align: center; background: #f9fafb; color: #6b7280; font-size: 12px; }
          .footer p { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Welcome, ${name}!</h1>
            <p>Your account has been verified successfully</p>
          </div>
          <div class="content">
            <p class="welcome-message">You're now ready to save and organize your favorite Hacker News stories!</p>
            <div class="features">
              <div class="feature-item">
                <span class="feature-emoji">📰</span>
                <div>Browse Top Stories</div>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">⭐</span>
                <div>Save Bookmarks</div>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">🔄</span>
                <div>Refresh Content</div>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">📱</span>
                <div>Access Anywhere</div>
              </div>
            </div>
            <a href="${frontendUrl}/stories" class="button" style="text-decoration: none;">📖 Start Exploring Stories</a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Browse the latest Hacker News stories, bookmark your favorites, and never lose track of interesting content again.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} HN Story Saver. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 11px;">
              This app helps you save and organize Hacker News stories that matter to you.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;