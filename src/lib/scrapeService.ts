import dbConnect from './mongodb';
import { Manga, Chapter } from './models';
import { scrapers } from './scrapers';
import { MangaData, ChapterData } from './scrapers/base';

export class ScrapeService {
  async searchAllSites(query: string): Promise<MangaData[]> {
    const results: MangaData[] = [];
    
    for (const [siteName, scraper] of Object.entries(scrapers)) {
      try {
        const siteResults = await scraper.searchManga(query);
        results.push(...siteResults.map(manga => ({ ...manga, site: siteName })));
      } catch (error) {
        console.error(`Error searching ${siteName}:`, error);
      }
    }
    
    return results;
  }

  async scrapeManga(url: string, siteName: string, mangaId?: string): Promise<string | null> {
    await dbConnect();
    
    const scraper = scrapers[siteName];
    if (!scraper) throw new Error(`Scraper not found: ${siteName}`);

    try {
      const mangaData = await scraper.getMangaDetails(url);
      let manga;
      
      if (mangaId) {
        // Rescraping existing manga
        manga = await Manga.findById(mangaId);
        if (manga) {
          // Update existing manga data
          // Only update author if no uploaded author exists
          if (!manga.uploadedAuthor) manga.author = mangaData.author || manga.author;
          manga.genres = mangaData.genres || manga.genres;
          // Only update summary if no uploaded summary exists
          if (!manga.uploadedSummary) manga.summary = mangaData.summary || manga.summary;
          // Only update cover if no uploaded cover exists and scraped cover is not empty
          if (!manga.uploadedCover && mangaData.cover) manga.cover = mangaData.cover;
          manga.status = mangaData.status || manga.status;
          manga.updatedAt = new Date();
        }
      } else {
        // New manga scraping
        const slug = this.createSlug(mangaData.title);
        manga = await Manga.findOne({ slug });
        
        if (!manga) {
          manga = new Manga({
            title: mangaData.title,
            slug,
            author: mangaData.author,
            genres: mangaData.genres,
            summary: mangaData.summary,
            cover: mangaData.cover,
            status: mangaData.status,
            sources: [{ site: siteName, url, lastUpdated: new Date() }]
          });
        } else {
          // Update existing manga
          const existingSource = manga.sources.find((s: any) => s.site === siteName);
          if (existingSource) {
            existingSource.url = url;
            existingSource.lastUpdated = new Date();
          } else {
            manga.sources.push({ site: siteName, url, lastUpdated: new Date() });
          }
          manga.updatedAt = new Date();
        }
      }

      await manga.save();

      // Scrape chapters
      await this.scrapeChapters(manga._id, url, siteName);

      return manga._id.toString();
    } catch (error) {
      console.error(`Error scraping manga from ${siteName}:`, error);
      return null;
    }
  }

  async scrapeChapters(mangaId: string, mangaUrl: string, siteName: string): Promise<void> {
    const scraper = scrapers[siteName];
    if (!scraper) return;

    try {
      const chapters = await scraper.getChapters(mangaUrl);
      const manga = await Manga.findById(mangaId);
      
      // Use current manga title for folder path (respects renames)
      const baseFolderPath = manga?.title || 'Unknown';
      let hasNewChapters = false;
      
      // Update existing chapters to use new folder path if manga was renamed
      const existingChapters = await Chapter.find({ mangaId });
      for (const chapter of existingChapters) {
        const currentBasePath = chapter.folderPath?.split('/Chapter')[0];
        if (currentBasePath && currentBasePath !== baseFolderPath) {
          chapter.folderPath = `${baseFolderPath}/Chapter ${chapter.number}`;
          await chapter.save();
        }
      }
      
      for (const chapterData of chapters) {
        const existingChapter = await Chapter.findOne({
          mangaId,
          number: chapterData.number,
          language: 'en'
        });

        if (!existingChapter) {
          try {
            const pages = await scraper.getPages(chapterData.url);
            const folderPath = `${baseFolderPath}/Chapter ${chapterData.number}`;
            
            const chapter = new Chapter({
              mangaId,
              title: chapterData.title,
              number: chapterData.number,
              folderPath,
              pages,
              sources: [{ site: siteName, url: chapterData.url }]
            });

            await chapter.save();
            hasNewChapters = true;
          } catch (error) {
            console.error(`Error saving chapter ${chapterData.number}:`, error);
          }
        } else {
          // Clean up logo images from existing chapters
          const hasLogo = existingChapter.pages.some((page: any) => page.image?.includes('logo_200x200.png'));
          if (hasLogo) {
            existingChapter.pages = existingChapter.pages.filter((page: any) => !page.image?.includes('logo_200x200.png'));
            await existingChapter.save();
          }
        }
      }
      
      // Update manga timestamp if new chapters were added
      if (hasNewChapters && manga) {
        manga.updatedAt = new Date();
        await manga.save();
      }
    } catch (error) {
      console.error(`Error scraping chapters for ${mangaId}:`, error);
    }
  }

  async cleanupLogoImages(): Promise<{ cleaned: number }> {
    await dbConnect();
    
    let cleaned = 0;
    
    // Clean logo images from chapters
    const chapters = await Chapter.find({
      'pages.image': { $regex: 'logo_200x200\.png' }
    });
    
    for (const chapter of chapters) {
      const originalLength = chapter.pages.length;
      chapter.pages = chapter.pages.filter((page: any) => !page.image?.includes('logo_200x200.png'));
      
      if (chapter.pages.length < originalLength) {
        await chapter.save();
        cleaned++;
      }
    }
    
    // Clean broken MangaDx URLs from manga covers
    const brokenCovers = await Manga.find({
      cover: { $regex: 'uploads\.mangadx\.org' }
    });
    
    for (const manga of brokenCovers) {
      manga.cover = '';
      manga.uploadedCover = false;
      await manga.save();
      cleaned++;
    }
    
    return { cleaned };
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}