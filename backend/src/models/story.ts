import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  title: string;
  url: string;
  points: number;
  author: string;
  postedAt: Date;
  storyId: number; // Original HN story ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    postedAt: {
      type: Date,
      required: true,
    },
    storyId: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
storySchema.index({ points: -1 });
storySchema.index({ postedAt: -1 });

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can bookmark a story only once
bookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const Story = mongoose.model<IStory>('Story', storySchema);
export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);