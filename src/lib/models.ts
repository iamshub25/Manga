import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MangaSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  author: String,
  genres: [String],
  summary: String,
  status: { type: String, enum: ['ongoing', 'completed', 'hiatus'], default: 'ongoing' },
  cover: String,
  uploadedCover: { type: Boolean, default: false },
  uploadedSummary: { type: Boolean, default: false },
  uploadedAuthor: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sources: [{
    site: String,
    url: String,
    lastUpdated: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChapterSchema = new mongoose.Schema({
  mangaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga', required: true, index: true },
  title: { type: String, required: true },
  number: { type: String, required: true },
  language: { type: String, default: 'en' },
  folderPath: String,
  pages: [{
    number: Number,
    image: String
  }],
  sources: [{
    site: String,
    url: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ChapterSchema.index({ mangaId: 1, number: 1, language: 1 }, { unique: true });

const SiteConfigSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  baseUrl: String,
  enabled: { type: Boolean, default: true },
  lastScrape: Date,
  config: mongoose.Schema.Types.Mixed
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  readingMode: { type: String, enum: ['single', 'double', 'webtoon'], default: 'single' },
  createdAt: { type: Date, default: Date.now }
});

// Reading Progress Schema
const ReadingProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mangaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga', required: true },
  chapterNumber: String,
  pageNumber: { type: Number, default: 1 },
  totalPages: Number,
  lastRead: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
});

ReadingProgressSchema.index({ userId: 1, mangaId: 1 }, { unique: true });

// Bookmark Schema
const BookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mangaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga', required: true },
  status: { type: String, enum: ['plan_to_read', 'reading', 'completed', 'dropped', 'on_hold'], default: 'plan_to_read' },
  rating: { type: Number, min: 1, max: 10 },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BookmarkSchema.index({ userId: 1, mangaId: 1 }, { unique: true });

// Reading List Schema
const ReadingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  isPublic: { type: Boolean, default: false },
  manga: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manga' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Manga = mongoose.models.Manga || mongoose.model('Manga', MangaSchema);
export const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
export const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const ReadingProgress = mongoose.models.ReadingProgress || mongoose.model('ReadingProgress', ReadingProgressSchema);
export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
export const ReadingList = mongoose.models.ReadingList || mongoose.model('ReadingList', ReadingListSchema);