import { BaseScraper } from './base';
import { MgekoScraper } from './mgeko';
import { MangadexScraper } from './mangadex';

import { MgekoJumboScraper } from './mgekojumbo';

export const scrapers: Record<string, BaseScraper> = {
  mgeko: new MgekoScraper(),
  mangadx: new MangadexScraper(),

  mgekojumbo: new MgekoJumboScraper(),
};

export { BaseScraper, MgekoScraper, MangadexScraper, MgekoJumboScraper };
export * from './base';