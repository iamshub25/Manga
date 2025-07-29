# MangaCap - Manga Management System

A comprehensive manga management system that can scrape from multiple sources and manage thousands of manga with MongoDB.

## Features

- **Multi-Source Scraping**: Scrape manga from various sites (currently supports Mgeko)
- **Database Management**: Store thousands of manga with MongoDB
- **Search System**: Search both database and live sources
- **Chapter Management**: Organize chapters with page data
- **Admin Panel**: Easy-to-use interface for managing scraped content
- **Responsive Design**: Works on desktop and mobile

## Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/mangacap
REDIS_URL=redis://localhost:6379
```

3. Start MongoDB and Redis services

4. Run the development server:
```bash
npm run dev
```

## Usage

### Admin Panel
Visit `/admin` to access the scraping interface:
- Scrape manga directly by URL
- Search and scrape from multiple sources
- Manage existing manga

### API Endpoints

#### Manga
- `GET /api/manga` - List manga with pagination and filters
- `POST /api/manga` - Scrape new manga
- `GET /api/manga/[id]` - Get manga details
- `PUT /api/manga/[id]` - Update manga

#### Search
- `GET /api/manga/search?q=query` - Search database
- `GET /api/manga/search?q=query&source=live` - Search live sources

#### Chapters
- `GET /api/manga/[id]/chapters` - Get manga chapters
- `GET /api/manga/[id]/chapter/[chapter]` - Get chapter pages

#### Scraping
- `POST /api/scrape` - Manual scraping operations

### Command Line Scraping

```bash
# Scrape popular manga
npm run scrape popular

# Search and scrape
npm run scrape search "one piece"
```

## Adding New Sources

1. Create a new scraper in `src/lib/scrapers/`:

```typescript
import { BaseScraper, MangaData, ChapterData, PageData } from './base';

export class NewSiteScraper extends BaseScraper {
  siteName = 'newsite';
  baseUrl = 'https://newsite.com';

  async searchManga(query: string): Promise<MangaData[]> {
    // Implementation
  }

  async getMangaDetails(url: string): Promise<MangaData> {
    // Implementation
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    // Implementation
  }

  async getPages(chapterUrl: string): Promise<PageData[]> {
    // Implementation
  }
}
```

2. Register in `src/lib/scrapers/index.ts`:

```typescript
import { NewSiteScraper } from './newsite';

export const scrapers: Record<string, BaseScraper> = {
  mgeko: new MgekoScraper(),
  newsite: new NewSiteScraper(),
};
```

## Database Schema

### Manga
- title, slug, author, genres, summary
- cover, status, rating, views
- sources (multiple site support)
- timestamps

### Chapter
- mangaId, title, number, language
- pages array with image URLs
- sources for multi-site support
- timestamps

## Performance

- MongoDB indexing for fast searches
- Pagination for large datasets
- Lazy loading for images
- Caching support with Redis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your scraper or feature
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.