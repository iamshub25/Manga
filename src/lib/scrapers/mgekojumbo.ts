import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, MangaData, ChapterData, PageData } from './base';

export class MgekoJumboScraper extends BaseScraper {
  siteName = 'mgekojumbo';
  baseUrl = 'https://www.mgeko.cc';

  async searchManga(query: string): Promise<MangaData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}?search=${encodeURIComponent(query)}`);
      const $ = cheerio.load(response.data);
      const mangas: MangaData[] = [];

      $('.manga-item, .item, .entry').each((_, element) => {
        const $el = $(element);
        const title = $el.find('a').text().trim() || $el.find('.title').text().trim();
        const url = $el.find('a').attr('href');
        const cover = $el.find('img').attr('src') || $el.find('img').attr('data-src');


        if (title && url) {
          mangas.push({
            title,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            cover: cover?.startsWith('http') ? cover : cover ? `https://www.mgeko.cc${cover}` : undefined
          });
        }
      });

      return mangas;
    } catch (error) {
      console.error('MgekoJumbo search error:', error);
      return [];
    }
  }

  async getMangaDetails(url: string): Promise<MangaData> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $('h1, .manga-title, .title').first().text().trim();
      const author = $('.author, .manga-author').text().trim();
      const summary = $('.summary, .description, .synopsis').text().trim();
      const cover = $('.manga-cover img, .cover img').attr('src');
      
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
        cover: cover?.startsWith('http') ? cover : cover ? `https://www.mgeko.cc${cover}` : undefined,
        url
      };
    } catch (error) {
      console.error('MgekoJumbo manga details error:', error);
      throw error;
    }
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    try {
      // Try the all-chapters URL first
      let chaptersUrl = mangaUrl;
      if (!mangaUrl.includes('/all-chapters/')) {
        chaptersUrl = mangaUrl.replace(/\/$/, '') + '/all-chapters/';
      }
      
      console.log(`MgekoJumbo fetching chapters from: ${chaptersUrl}`);
      const response = await axios.get(chaptersUrl);
      const $ = cheerio.load(response.data);
      const chapters: ChapterData[] = [];

      // Use the correct selector based on the HTML structure
      $('li[data-chapterno] a').each((_, element) => {
        const $link = $(element);
        const url = $link.attr('href');
        const title = $link.attr('title');
        
        if (title && url) {
          // Extract chapter number from title like "Chapter talent-swallowing-magician-chapter-15-eng-li"
          const numberMatch = title.match(/chapter-(\d+)-/i);
          const number = numberMatch ? numberMatch[1] : (chapters.length + 1).toString();

          chapters.push({
            title: `Chapter ${number}`,
            number,
            url: url.startsWith('http') ? url : `https://www.mgeko.cc${url}`
          });
        }
      });

      console.log(`MgekoJumbo found ${chapters.length} chapters`);
      return chapters.reverse();
    } catch (error) {
      console.error('MgekoJumbo chapters error:', error);
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

      console.log(`MgekoJumbo page HTML length: ${response.data.length}`);

      // Check all images and filter for manga pages
      $('img').each((index, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-lazy-src');
        if (src && (src.includes('page') || src.includes('chapter') || src.includes('manga') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) && !src.includes('logo_200x200.png')) {
          // Skip small images (likely UI elements)
          const width = $(element).attr('width');
          const height = $(element).attr('height');
          if (width && height && (parseInt(width) < 100 || parseInt(height) < 100)) {
            return;
          }
          
          if (!pages.find(p => p.image === src)) {
            pages.push({
              number: pages.length + 1,
              image: src.startsWith('http') ? src : `https://www.mgeko.cc${src}`
            });
          }
        }
      });

      console.log(`MgekoJumbo scraped ${pages.length} pages from ${chapterUrl}`);
      if (pages.length === 0) {
        console.log('No images found, total img tags:', $('img').length);
      }
      return pages;
    } catch (error) {
      console.error('MgekoJumbo pages error:', error);
      return [];
    }
  }
}