import { BaseScraper, MangaData, ChapterData, PageData } from './base';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ThunderScansScraper extends BaseScraper {
  siteName = 'thunderscans';
  baseUrl = 'https://en-thunderscans.com';

  async searchManga(query: string): Promise<MangaData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/?s=${encodeURIComponent(query)}`);
      const $ = cheerio.load(response.data);
      const results: MangaData[] = [];

      $('.bs .bsx').each((_, element) => {
        const $el = $(element);
        const title = $el.find('.bigor .tt').text().trim();
        const url = $el.find('a').attr('href');
        const cover = $el.find('.limit img').attr('src');
        
        if (title && url) {
          results.push({
            title,
            url,
            cover: cover || '',
            author: '',
            genres: [],
            summary: ''
          });
        }
      });

      return results;
    } catch (error) {
      console.error('ThunderScans search error:', error);
      return [];
    }
  }

  async getMangaDetails(url: string): Promise<MangaData> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $('.entry-title').text().trim() || $('.postbody h1').text().trim();
      const cover = $('.thumb img').attr('src') || $('.wp-post-image').attr('src');
      const summary = $('.entry-content p').first().text().trim() || $('.summary .desc').text().trim();
      
      // Extract genres
      const genres: string[] = [];
      $('.mgen a, .genre-info a').each((_, el) => {
        const genre = $(el).text().trim();
        if (genre) genres.push(genre);
      });

      // Extract author
      const author = $('.author-content').text().trim() || 
                    $('.fmed:contains("Author") b').text().trim() ||
                    $('.tsinfo .imptdt:contains("Author")').next().text().trim();

      // Extract status
      let status: 'ongoing' | 'completed' | 'hiatus' = 'ongoing';
      const statusText = $('.status .value').text().trim().toLowerCase() ||
                        $('.tsinfo .imptdt:contains("Status")').next().text().trim().toLowerCase();
      
      if (statusText.includes('completed') || statusText.includes('complete')) {
        status = 'completed';
      } else if (statusText.includes('hiatus') || statusText.includes('on hold')) {
        status = 'hiatus';
      }

      return {
        title,
        author,
        genres,
        summary,
        cover: cover || '',
        status,
        url
      };
    } catch (error) {
      console.error('ThunderScans manga details error:', error);
      throw error;
    }
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    try {
      const response = await axios.get(mangaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const chapters: ChapterData[] = [];

      // ThunderScans specific chapter selector
      $('a .chbox').each((_, element) => {
        const $chbox = $(element);
        const $link = $chbox.parent('a');
        const href = $link.attr('href');
        const chapterText = $chbox.find('.chapternum').text().trim();
        
        if (href && chapterText) {
          const numberMatch = chapterText.match(/chapter\s*(\d+(?:\.\d+)?)/i) || 
                             chapterText.match(/(\d+(?:\.\d+)?)/);
          
          const number = numberMatch ? numberMatch[1] : (chapters.length + 1).toString();
          
          chapters.push({
            title: chapterText,
            number,
            url: href.startsWith('http') ? href : `${this.baseUrl}${href}`
          });
        }
      });

      return chapters.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
    } catch (error) {
      console.error('ThunderScans chapters error:', error);
      return [];
    }
  }

  async getPages(chapterUrl: string): Promise<PageData[]> {
    try {
      console.log(`ThunderScans: Accessing chapter URL: ${chapterUrl}`);
      const response = await axios.get(chapterUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const pages: PageData[] = [];

      console.log('ThunderScans: Trying .ts-main-image selector');
      // Primary selector for ThunderScans
      $('.ts-main-image').each((index, element) => {
        const $img = $(element);
        let src = $img.attr('src') || $img.attr('data-src');
        
        if (src) {
          console.log(`ThunderScans: Found image with .ts-main-image: ${src}`);
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = this.baseUrl + src;
          
          pages.push({ number: index + 1, image: src });
        }
      });

      // Try all images if specific selectors fail
      if (pages.length === 0) {
        console.log('ThunderScans: Trying all img tags');
        $('img').each((index, element) => {
          const $img = $(element);
          let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
          
          if (src) {
            console.log(`ThunderScans: Found img: ${src}`);
            if (src.startsWith('//')) src = 'https:' + src;
            else if (src.startsWith('/')) src = this.baseUrl + src;
            
            // Accept any large image that looks like manga content
            if (src.match(/\.(jpg|jpeg|png|webp)$/i) && 
                src.length > 50 &&
                !src.includes('logo') && 
                !src.includes('avatar') &&
                !src.includes('banner') &&
                !pages.find(p => p.image === src)) {
              pages.push({ number: pages.length + 1, image: src });
            }
          }
        });
      }

      console.log(`ThunderScans: Total pages found: ${pages.length}`);
      return pages;
    } catch (error) {
      console.error('ThunderScans pages error:', error);
      return [];
    }
  }
}