import {  query, param } from 'express-validator';

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sortBy')
    .optional()
    .isIn(['points', 'postedAt', 'title', 'author'])
    .withMessage('Sort by must be points, postedAt, title, or author'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const storyIdValidator = [
  param('storyId')
    .notEmpty()
    .withMessage('Story ID is required')
    .isMongoId()
    .withMessage('Invalid story ID format'),
];