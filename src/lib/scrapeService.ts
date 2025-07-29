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

  async scrapeManga(url: string, siteName: string): Promise<string | null> {
    await dbConnect();
    
    const scraper = scrapers[siteName];
    if (!scraper) throw new Error(`Scraper not found: ${siteName}`);

    try {
      const mangaData = await scraper.getMangaDetails(url);
      const slug = this.createSlug(mangaData.title);

      let manga = await Manga.findOne({ slug });
      
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
        const existingSource = manga.sources.find(s => s.site === siteName);
        if (existingSource) {
          existingSource.url = url;
          existingSource.lastUpdated = new Date();
        } else {
          manga.sources.push({ site: siteName, url, lastUpdated: new Date() });
        }
        manga.updatedAt = new Date();
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
      
      for (const chapterData of chapters) {
        const existingChapter = await Chapter.findOne({
          mangaId,
          number: chapterData.number,
          language: 'en'
        });

        if (!existingChapter) {
          try {
            const pages = await scraper.getPages(chapterData.url);
            const manga = await Manga.findById(mangaId);
            const folderPath = `${manga?.title || 'Unknown'}/Chapter ${chapterData.number}`;
            
            const chapter = new Chapter({
              mangaId,
              title: chapterData.title,
              number: chapterData.number,
              folderPath,
              pages,
              sources: [{ site: siteName, url: chapterData.url }]
            });

            await chapter.save();
          } catch (error) {
            console.error(`Error saving chapter ${chapterData.number}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping chapters for ${mangaId}:`, error);
    }
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}