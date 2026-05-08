import { Router } from 'express';
import validateRequest from '../validator/validateRequest';
import {
  registerValidator,
  loginValidator,
  otpValidator,
  resendOTPValidator,
} from '../validator/authValidator';
import { paginationValidator, storyIdValidator } from '../validator/storyValidator';
import container from '../dependencyInjector/container';

const router = Router();
const { authController, authMiddleware, storyController } = container;

// Auth routes
router.post(
  '/register',
  registerValidator,
  validateRequest,
  authController.register.bind(authController)
);

router.post(
  '/verifyOtp',
  otpValidator,
  validateRequest,
  authController.verifyOTP.bind(authController)
);

router.post(
  '/resendOtp',
  resendOTPValidator,
  validateRequest,
  authController.resendOTP.bind(authController)
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login.bind(authController)
);

router.post(
  '/logout',
  authMiddleware.authenticate.bind(authMiddleware),
  authController.logout.bind(authController)
);

// Story routes
router.get(
  '/stories',
  authMiddleware.authenticateOptional.bind(authMiddleware),
  paginationValidator,
  validateRequest,
  storyController.getAllStories.bind(storyController)
);



router.get(
  '/stories/:storyId',
  storyIdValidator,
  validateRequest,
  storyController.getStoryById.bind(storyController)
);

router.post(
  '/scrape',
  authMiddleware.authenticate.bind(authMiddleware),
  storyController.scrapeStories.bind(storyController)
);

router.post(
  '/stories/:storyId/bookmark',
  authMiddleware.authenticate.bind(authMiddleware),
  storyIdValidator,
  validateRequest,
  storyController.toggleBookmark.bind(storyController)
);

router.get(
  '/bookmarks',
  authMiddleware.authenticate.bind(authMiddleware),
  paginationValidator,
  validateRequest,
  storyController.getBookmarks.bind(storyController)
);

export default router;