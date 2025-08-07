import { BaseScraper } from './base';
import { MgekoScraper } from './mgeko';
import { MangadexScraper } from './mangadex';
import { MgekoJumboScraper } from './mgekojumbo';
import { ThunderScansScraper } from './thunderscans';

export const scrapers: Record<string, BaseScraper> = {
  mgeko: new MgekoScraper(),
  mangadx: new MangadexScraper(),
  mgekojumbo: new MgekoJumboScraper(),
  thunderscans: new ThunderScansScraper(),
};

export { BaseScraper, MgekoScraper, MangadexScraper, MgekoJumboScraper, ThunderScansScraper };
export * from './base';