import axios from 'axios';
import * as cheerio from 'cheerio';
import { Story } from '../models/story';
import AppError from '../utils/appError';

export interface HackerNewsStory {
  title: string;
  url: string;
  points: number;
  author: string;
  postedAt: Date;
  storyId: number;
}

export class ScraperService {
  private readonly BASE_URL = 'https://news.ycombinator.com';

  async scrapeTopStories(limit: number = 10): Promise<HackerNewsStory[]> {
    try {
      const { data } = await axios.get(this.BASE_URL);
      const $ = cheerio.load(data);
      const stories: HackerNewsStory[] = [];

      $('.athing').each((index, element) => {
        if (stories.length >= limit) return false;

        const storyId = parseInt($(element).attr('id') || '0');
        const titleElement = $(element).find('.titleline > a');
        const title = titleElement.first().text().trim();
        const url = titleElement.first().attr('href') || '';

        const nextRow = $(element).next();
        const subtext = nextRow.find('.subline');

        const author = subtext.find('.hnuser').first().text().trim();

        let points = 0;
        const pointsText = subtext.find('.score').first().text();
        if (pointsText) {
          points = parseInt(pointsText) || 0;
        }

        const ageText =
          subtext.find('.age').first().attr('title') ||
          subtext.find('.age').first().text();
        let postedAt = new Date();
        if (ageText) {
          postedAt = this.parseRelativeTime(ageText);
        }

        stories.push({
          storyId,
          title,
          url: url.startsWith('item') ? `${this.BASE_URL}/${url}` : url,
          points,
          author: author || 'unknown',
          postedAt,
        });
      });

      return stories;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new AppError('Failed to scrape Hacker News', 500);
    }
  }

  private parseRelativeTime(timeString: string): Date {
    const now = new Date();
    const lowerTime = timeString.toLowerCase();

    const minutes = lowerTime.match(/(\d+)\s*minute/);
    const hours = lowerTime.match(/(\d+)\s*hour/);
    const days = lowerTime.match(/(\d+)\s*day/);

    if (minutes) return new Date(now.getTime() - parseInt(minutes[1]) * 60000);
    if (hours) return new Date(now.getTime() - parseInt(hours[1]) * 3600000);
    if (days) return new Date(now.getTime() - parseInt(days[1]) * 86400000);

    const dateMatch = timeString.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) return new Date(dateMatch[0]);

    return now;
  }

  async saveStories(stories: HackerNewsStory[]): Promise<void> {
    const operations = stories.map(story => ({
      updateOne: {
        filter: { storyId: story.storyId },
        update: { $set: story },
        upsert: true,
      },
    }));

    await Story.bulkWrite(operations);
  }

  async scrapeAndSave(): Promise<{ count: number; message: string }> {
    const stories = await this.scrapeTopStories(10);
    await this.saveStories(stories);

    return {
      count: stories.length,
      message: `Successfully scraped and saved ${stories.length} stories`,
    };
  }
}