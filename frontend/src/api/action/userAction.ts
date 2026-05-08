import { API } from "../../services/axios"; 
import userRouterEndPoints from "../../endpoints/userEndpoint"; 

export interface Story {
  _id: string;
  title: string;
  url: string;
  points: number;
  author: string;
  postedAt: string;
  storyId: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked?:boolean;
}

export interface PaginatedResponse {
  stories: Story[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
// Story API functions
export const getAllStories = async (page: number = 1, limit: number = 10, sortBy: string = 'points', sortOrder: string = 'desc') => {
  const response = await API.get(userRouterEndPoints.getAllStories, {
    params: { page, limit, sortBy, sortOrder }
  });
  return response.data;
};

export const getStoryById = async (storyId: string) => {
  const response = await API.get(userRouterEndPoints.getStoryById(storyId));
  return response.data;
};

export const scrapeStories = async () => {
  const response = await API.post(userRouterEndPoints.scrapeStories);
  return response.data;
};

export const toggleBookmark = async (storyId: string) => {
  const response = await API.post(userRouterEndPoints.toggleBookmark(storyId));
  return response.data;
};

export const getBookmarks = async (page: number = 1, limit: number = 10) => {
  const response = await API.get(userRouterEndPoints.getBookmarks, {
    params: { page, limit }
  });
  return response.data;
};