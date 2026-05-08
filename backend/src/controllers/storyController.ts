import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/storyService';
import { ScraperService } from '../services/scraperService';
import { AuthRequest } from '../middlewares/authMiddleware';

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
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllStories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validation is fully handled by paginationValidator at the route level
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'points';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const userId = req.user?.userId
      const result = await this.storyService.getAllStories({ page, limit, sortBy, sortOrder },userId);

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
      // storyId is guaranteed a valid MongoId by storyIdValidator at the route level
      const story = await this.storyService.getStoryById(req.params.storyId);

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
      // userId is guaranteed by authMiddleware.authenticate
      // storyId is guaranteed a valid MongoId by storyIdValidator at the route level
      const result = await this.storyService.toggleBookmark(req.user!.userId, req.params.storyId);

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
      // userId is guaranteed by authMiddleware.authenticate
      // page/limit are guaranteed valid by paginationValidator at the route level
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.storyService.getUserBookmarks(req.user!.userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}