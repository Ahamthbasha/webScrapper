import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/storyService';
import { ScraperService } from '../services/scraperService';
import { AuthRequest } from '../middlewares/authMiddleware';
import AppError from '../utils/appError';

export class StoryController {
  constructor(
    private storyService: StoryService,
    private scraperService: ScraperService
  ) {}

  scrapeStories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.scraperService.scrapeAndSave();
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          count: result.count,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllStories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'points';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      if (page < 1 || limit < 1) {
        throw new AppError('Page and limit must be positive numbers', 400);
      }

      if (limit > 50) {
        throw new AppError('Limit cannot exceed 50', 400);
      }

      const result = await this.storyService.getAllStories({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getStoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params; // Changed from 'id' to 'storyId'
      const story = await this.storyService.getStoryById(storyId);

      res.status(200).json({
        success: true,
        data: { story },
      });
    } catch (error) {
      next(error);
    }
  };

  toggleBookmark = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params; // Changed from 'id' to 'storyId'
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await this.storyService.toggleBookmark(userId, storyId);

      res.status(200).json({
        success: true,
        message: result.bookmarked ? 'Story bookmarked' : 'Bookmark removed',
        data: { bookmarked: result.bookmarked },
      });
    } catch (error) {
      next(error);
    }
  };

  getBookmarks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (page < 1 || limit < 1) {
        throw new AppError('Page and limit must be positive numbers', 400);
      }

      if (limit > 50) {
        throw new AppError('Limit cannot exceed 50', 400);
      }

      const result = await this.storyService.getUserBookmarks(userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}