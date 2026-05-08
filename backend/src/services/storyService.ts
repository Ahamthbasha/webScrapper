import { Story, Bookmark } from '../models/story';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class StoryService {
  async getAllStories(options: PaginationOptions) {
    const { page, limit, sortBy = 'points', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [stories, total] = await Promise.all([
      Story.find().sort(sort).skip(skip).limit(limit).lean(),
      Story.countDocuments(),
    ]);

    return {
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getStoryById(id: string) {
    // No ObjectId check needed — route-level storyIdValidator ensures valid MongoId
    const story = await Story.findById(id);
    if (!story) {
      throw new AppError('Story not found', 404);
    }
    return story;
  }

  async toggleBookmark(userId: string, storyId: string): Promise<{ bookmarked: boolean }> {
    // No ObjectId check needed — route-level storyIdValidator ensures valid MongoId
    const story = await Story.findById(storyId);
    if (!story) {
      throw new AppError('Story not found', 404);
    }

    const existingBookmark = await Bookmark.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      storyId: new mongoose.Types.ObjectId(storyId),
    });

    if (existingBookmark) {
      await existingBookmark.deleteOne();
      return { bookmarked: false };
    }

    await Bookmark.create({
      userId: new mongoose.Types.ObjectId(userId),
      storyId: new mongoose.Types.ObjectId(storyId),
    });
    return { bookmarked: true };
  }

  async getUserBookmarks(userId: string, options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('storyId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
    ]);

    const stories = bookmarks
      .filter(bookmark => bookmark.storyId)
      .map(bookmark => bookmark.storyId);

    return {
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async isStoryBookmarked(userId: string, storyId: string): Promise<boolean> {
    const bookmark = await Bookmark.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      storyId: new mongoose.Types.ObjectId(storyId),
    });
    return !!bookmark;
  }
}