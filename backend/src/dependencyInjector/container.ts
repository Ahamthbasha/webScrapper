import { JwtService } from '../services/jwtService';
import { EmailService } from '../services/emailService';
import { OTPService } from '../services/otpService';
import { AuthService } from '../services/authService';
import AuthController from '../controllers/authController';
import AuthMiddleware from '../middlewares/authMiddleware';
import { StoryService } from '../services/storyService';
import { ScraperService } from '../services/scraperService';
import { StoryController } from '../controllers/storyController';
import dotenv from 'dotenv';

dotenv.config();

class DIContainer {
  private static instance: DIContainer;
  
  public jwtService: JwtService;
  public emailService: EmailService;
  public otpService: OTPService;
  public authService: AuthService;
  public authController: AuthController;
  public authMiddleware: AuthMiddleware;
  public storyService: StoryService;
  public scraperService: ScraperService;
  public storyController: StoryController;

  private constructor() {
    this.jwtService = new JwtService();
    
    // EmailService expects user (email) and pass (app password for Gmail)
    this.emailService = new EmailService({
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
      fromName: process.env.EMAIL_FROM_NAME || 'Web Scrapper',
    });
    
    this.otpService = new OTPService(this.emailService);
    this.authService = new AuthService(this.jwtService, this.otpService, this.emailService);
    this.authController = new AuthController(this.authService);
    this.authMiddleware = new AuthMiddleware(this.jwtService);
    this.storyService = new StoryService();
    this.scraperService = new ScraperService();
    this.storyController = new StoryController(this.storyService, this.scraperService);
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

export const container = DIContainer.getInstance();
export default container;