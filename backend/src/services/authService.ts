import User, { UserRole } from '../models/User';
import { JwtService, IRegistrationPayload, ITokenPair } from './jwtService';
import { OTPService } from './otpService';
import { EmailService } from './emailService';
import AppError from '../utils/appError';

export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IVerifyOTPDTO {
  email: string;
  otp: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  tokens: ITokenPair;
}

export class AuthService {
  constructor(
    private jwtService: JwtService,
    private otpService: OTPService,
    private emailService: EmailService
  ) {}

  async initiateRegistration(data: IRegisterDTO): Promise<{
    registrationToken: string;
    expiresIn: number;
    email: string;
  }> {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: data.email 
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const registrationPayload: IRegistrationPayload = {
      name: data.name,
      email: data.email,
      password: data.password,
      timestamp: Date.now(),
    };

    const registrationToken = this.jwtService.generateRegistrationToken(registrationPayload);

    const { expiresIn } = await this.otpService.generateAndSendOTP(data.email);

    return {
      registrationToken,
      expiresIn,
      email: data.email,
    };
  }

  async verifyOTPAndCompleteRegistration(
    data: IVerifyOTPDTO,
    registrationToken: string
  ): Promise<{ success: boolean; message: string }> {
    // Verify OTP
    await this.otpService.verifyOTP(data.email, data.otp);

    // Verify registration token
    let registrationData: IRegistrationPayload;
    try {
      registrationData = this.jwtService.verifyRegistrationToken(registrationToken);
    } catch (error) {
      throw new AppError('Registration session expired. Please register again.', 400);
    }

    // Check email match
    if (registrationData.email !== data.email) {
      throw new AppError('Email mismatch. Please register again.', 400);
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ 
      email: data.email 
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    await User.create({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      isActive: true,
      role: UserRole.USER,
    });

    // Send welcome email (don't await, let it run in background)
    this.emailService.sendWelcomeEmail(data.email, registrationData.name).catch(console.error);

    return {
      success: true,
      message: 'Email verified successfully. Your account has been created.',
    };
  }

  async resendOTP(email: string): Promise<{ expiresIn: number }> {
    // Check if user exists and is active
    const existingUser = await User.findOne({ 
      email: email,
      isActive: true 
    });

    if (existingUser) {
      throw new AppError('This email is already registered and verified.', 409);
    }

    return this.otpService.resendOTP(email);
  }

  async login(data: ILoginDTO): Promise<IAuthResponse> {
    // Find user by email and explicitly select password field
    const user = await User.findOne({ 
      email: data.email 
    }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Please verify your email first. Check your inbox for OTP.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }
}

export default AuthService;