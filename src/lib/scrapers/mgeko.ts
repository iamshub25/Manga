import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, MangaData, ChapterData, PageData } from './base';

export class MgekoScraper extends BaseScraper {
  siteName = 'mgeko';
  baseUrl = 'https://mgeko.cc';

  async searchManga(query: string): Promise<MangaData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      const $ = cheerio.load(response.data);
      const mangas: MangaData[] = [];

      $('.manga-item, .search-item, [class*="manga"]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('a').text().trim() || $el.find('.title').text().trim();
        const url = $el.find('a').attr('href');
        const cover = $el.find('img').attr('src');

        if (title && url) {
          mangas.push({
            title,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            cover: cover?.startsWith('http') ? cover : cover ? `${this.baseUrl}${cover}` : undefined
          });
        }
      });

      return mangas;
    } catch (error) {
      console.error('Mgeko search error:', error);
      return [];
    }
  }

  async getMangaDetails(url: string): Promise<MangaData> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $('h1, .manga-title, .title').first().text().trim();
      const author = $('.author, .manga-author').text().trim();
      const summary = $('.summary, .description, .manga-summary').text().trim();
      const cover = $('img.cover, .manga-cover img, .poster img').attr('src');
      
      const genres: string[] = [];
      $('.genre, .tag, .category').each((_, el) => {
        const genre = $(el).text().trim();
        if (genre) genres.push(genre);
      });

      return {
        title,
        author: author || undefined,
        genres: genres.length > 0 ? genres : undefined,
        summary: summary || undefined,
        cover: cover?.startsWith('http') ? cover : cover ? `${this.baseUrl}${cover}` : undefined,
        url
      };
    } catch (error) {
      console.error('Mgeko manga details error:', error);
      throw error;
    }
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    try {
      const response = await axios.get(mangaUrl);
      const $ = cheerio.load(response.data);
      const chapters: ChapterData[] = [];

      $('.chapter-item, .chapter, [class*="chapter"]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('a').text().trim() || $el.text().trim();
        const url = $el.find('a').attr('href');
        
        // Extract chapter number from title
        const numberMatch = title.match(/chapter\s*(\d+(?:\.\d+)?)/i) || title.match(/(\d+(?:\.\d+)?)/);
        const number = numberMatch ? numberMatch[1] : chapters.length.toString();

        if (title && url) {
          chapters.push({
            title,
            number,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`
          });
        }
      });

      return chapters.reverse(); // Usually chapters are in reverse order
    } catch (error) {
      console.error('Mgeko chapters error:', error);
      return [];
    }
  }

  async getPages(chapterUrl: string): Promise<PageData[]> {
    try {
      const response = await axios.get(chapterUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const pages: PageData[] = [];

      // Log page content for debugging
      console.log(`Mgeko page HTML length: ${response.data.length}`);

      // Try all possible selectors
      const selectors = [
        'img',
        '.page-image',
        '.reader-image',
        '.manga-page img',
        '#reader img',
        '.chapter-content img',
        '.reading-content img',
        '.page img',
        'img[src*="page"]',
        'img[data-src*="page"]',
        'img[src*="chapter"]',
        'img[src*="manga"]'
      ];

      $('img').each((index, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-lazy-src');
        if (src && (src.includes('page') || src.includes('chapter') || src.includes('manga') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp'))) {
          if (!pages.find(p => p.image === src)) {
            pages.push({
              number: pages.length + 1,
              image: src.startsWith('http') ? src : `${this.baseUrl}${src}`
            });
          }
        }
      });

      console.log(`Mgeko scraped ${pages.length} pages from ${chapterUrl}`);
      if (pages.length === 0) {
        console.log('No images found, checking all img tags:', $('img').length);
      }
      return pages;
    } catch (error) {
      console.error('Mgeko pages error:', error);
      return [];
    }
  }
}