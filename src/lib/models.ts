import mongoose from 'mongoose';

const MangaSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  author: String,
  genres: [String],
  summary: String,
  description: { type: String, get: function() { return this.summary; }, set: function(v) { this.summary = v; } },
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

export const Manga = mongoose.models.Manga || mongoose.model('Manga', MangaSchema);
export const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
export const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);