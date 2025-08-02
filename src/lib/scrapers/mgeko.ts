import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, MangaData, ChapterData, PageData } from './base';

export class MgekoScraper extends BaseScraper {
  siteName = 'mgeko';
  baseUrl = 'https://mgeko.cc';

  async searchManga(query: string): Promise<MangaData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/?s=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      const mangas: MangaData[] = [];

      $('.bs .bsx, .listupd .bs .bsx').each((_, element) => {
        const $el = $(element);
        const title = $el.find('a').attr('title') || $el.find('.tt').text().trim();
        const url = $el.find('a').attr('href');
        const cover = $el.find('img').attr('src');

        if (title && url) {
          mangas.push({
            title,
            url,
            cover
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
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);



      const title = $('h1').first().text().split('\n')[0].trim() || 
                   $('title').text().replace('Read ', '').replace(' Manga Online for Free', '').trim();
      
      // Generic extraction
      let author = '';
      let summary = '';
      let cover = '';
      let status = '';
      const genres: string[] = [];
      
      // Find author
      $('*').each((_, el) => {
        const text = $(el).text();
        if (text.includes('Author') && !author) {
          author = $(el).next().text().trim() || $(el).parent().find('*:contains("Author")').next().text().trim();
        }
      });
      
      // Find summary/description
      $('p, div').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 100 && !summary) {
          summary = text;
        }
      });
      
      // Find cover image
      cover = $('img').first().attr('src') || '';
      
      // Find genres from links
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('genre') || href.includes('tag'))) {
          const genre = $(el).text().trim();
          if (genre && !genres.includes(genre)) genres.push(genre);
        }
      });



      return {
        title,
        author: author || undefined,
        genres: genres.length > 0 ? genres : undefined,
        summary: summary || undefined,
        cover,
        status: status.includes('completed') ? 'completed' : status.includes('ongoing') ? 'ongoing' : status.includes('hiatus') ? 'hiatus' : undefined,
        url
      };
    } catch (error) {
      console.error('Mgeko manga details error:', error);
      throw error;
    }
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    try {
      const chaptersUrl = mangaUrl.replace(/\/$/, '') + '/all-chapters/';
      const response = await axios.get(chaptersUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      const chapters: ChapterData[] = [];

      // Extract actual chapter links from the page
      $('a').each((_, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        const text = $el.text().trim();
        
        if (href && text && text.match(/\d+-eng-li/)) {
          const numberMatch = text.match(/(\d+(?:-\d+)?(?:\.\d+)?)/); 
          const number = numberMatch ? numberMatch[1] : (chapters.length + 1).toString();
          
          chapters.push({
            title: `Chapter ${number}`,
            number,
            url: href.startsWith('http') ? href : `${this.baseUrl}${href}`
          });
        }
      });

      return chapters.reverse();
    } catch (error) {
      console.error('Mgeko chapters error:', error);
      return [];
    }
  }

  async getPages(chapterUrl: string): Promise<PageData[]> {
    try {
      const response = await axios.get(chapterUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      const pages: PageData[] = [];

      const selectors = [
        '#readerarea img',
        '.rdminimal img', 
        '.reader-area img',
        '.reading-content img',
        '.chapter-content img',
        'img[src*=".jpg"], img[src*=".png"], img[src*=".jpeg"]',
        'img'
      ];

      for (const selector of selectors) {
        $(selector).each((index, element) => {
          const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-lazy-src');
          if (src && (src.includes('.jpg') || src.includes('.png') || src.includes('.jpeg')) && !src.includes('/static/img/logo_200x200.png') && !src.includes('logo_200x200.png')) {
            if (!pages.find(p => p.image === src)) {
              pages.push({
                number: pages.length + 1,
                image: src
              });
            }
          }
        });
        
        if (pages.length > 0) break;
      }

      return pages;
    } catch (error) {
      console.error('Mgeko pages error:', error);
      return [];
    }
  }
}