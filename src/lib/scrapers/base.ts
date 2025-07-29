export interface MangaData {
  title: string;
  author?: string;
  genres?: string[];
  summary?: string;
  cover?: string;
  status?: 'ongoing' | 'completed' | 'hiatus';
  url: string;
}

export interface ChapterData {
  title: string;
  number: string;
  url: string;
  pages?: PageData[];
}

export interface PageData {
  number: number;
  image: string;
}

export abstract class BaseScraper {
  abstract siteName: string;
  abstract baseUrl: string;

  abstract searchManga(query: string): Promise<MangaData[]>;
  abstract getMangaDetails(url: string): Promise<MangaData>;
  abstract getChapters(mangaUrl: string): Promise<ChapterData[]>;
  abstract getPages(chapterUrl: string): Promise<PageData[]>;

  protected createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}