import axios from 'axios';
import { BaseScraper, MangaData, ChapterData, PageData } from './base';

export class MangadexScraper extends BaseScraper {
  siteName = 'mangadex';
  baseUrl = 'https://api.mangadex.org';

  async searchManga(query: string): Promise<MangaData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/manga`, {
        params: {
          title: query,
          limit: 20,
          'includes[]': ['cover_art', 'author'],
          'availableTranslatedLanguage[]': 'en'
        }
      });

      return response.data.data.map((item: any) => {
        const coverArt = item.relationships.find((rel: any) => rel.type === 'cover_art');
        const author = item.relationships.find((rel: any) => rel.type === 'author');
        
        return {
          title: item.attributes.title.en || Object.values(item.attributes.title)[0],
          author: author?.attributes?.name,
          genres: item.attributes.tags
            ?.filter((tag: any) => tag.attributes.group === 'genre')
            .map((tag: any) => tag.attributes.name.en)
            .slice(0, 5),
          summary: item.attributes.description?.en,
          cover: coverArt ? `https://uploads.mangadex.org/covers/${item.id}/${coverArt.attributes.fileName}` : undefined,
          status: item.attributes.status === 'completed' ? 'completed' : 'ongoing',
          url: `https://mangadex.org/manga/${item.id}`
        };
      });
    } catch (error) {
      console.error('MangaDex search error:', error);
      return [];
    }
  }

  async getMangaDetails(url: string): Promise<MangaData> {
    const mangaId = url.split('/').pop();
    
    try {
      const response = await axios.get(`${this.baseUrl}/manga/${mangaId}`, {
        params: {
          'includes[]': ['cover_art', 'author']
        }
      });

      const item = response.data.data;
      const coverArt = item.relationships.find((rel: any) => rel.type === 'cover_art');
      const author = item.relationships.find((rel: any) => rel.type === 'author');

      return {
        title: item.attributes.title.en || Object.values(item.attributes.title)[0],
        author: author?.attributes?.name,
        genres: item.attributes.tags
          ?.filter((tag: any) => tag.attributes.group === 'genre')
          .map((tag: any) => tag.attributes.name.en),
        summary: item.attributes.description?.en,
        cover: coverArt ? `https://uploads.mangadx.org/covers/${item.id}/${coverArt.attributes.fileName}` : undefined,
        status: item.attributes.status === 'completed' ? 'completed' : 'ongoing',
        url
      };
    } catch (error) {
      console.error('MangaDx manga details error:', error);
      throw error;
    }
  }

  async getChapters(mangaUrl: string): Promise<ChapterData[]> {
    const mangaId = mangaUrl.split('/').pop();
    
    try {
      const response = await axios.get(`${this.baseUrl}/manga/${mangaId}/feed`, {
        params: {
          limit: 500,
          'translatedLanguage[]': 'en',
          'order[chapter]': 'asc'
        }
      });

      return response.data.data.map((item: any) => ({
        title: item.attributes.title || `Chapter ${item.attributes.chapter}`,
        number: item.attributes.chapter || '0',
        url: `https://mangadx.org/chapter/${item.id}`
      }));
    } catch (error) {
      console.error('MangaDx chapters error:', error);
      return [];
    }
  }

  async getPages(chapterUrl: string): Promise<PageData[]> {
    const chapterId = chapterUrl.split('/').pop();
    
    try {
      const response = await axios.get(`${this.baseUrl}/at-home/server/${chapterId}`);
      const { baseUrl, chapter } = response.data;
      
      return chapter.data.map((filename: string, index: number) => ({
        number: index + 1,
        image: `${baseUrl}/data/${chapter.hash}/${filename}`
      }));
    } catch (error) {
      console.error('MangaDx pages error:', error);
      return [];
    }
  }
}