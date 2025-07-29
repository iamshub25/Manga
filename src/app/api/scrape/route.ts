import { NextRequest, NextResponse } from 'next/server';
import { ScrapeService } from '@/lib/scrapeService';

export async function POST(request: NextRequest) {
  try {
    const { action, url, site, query } = await request.json();
    const scrapeService = new ScrapeService();

    switch (action) {
      case 'manga':
        if (!url || !site) {
          return NextResponse.json({ error: 'URL and site required' }, { status: 400 });
        }
        
        const mangaId = await scrapeService.scrapeManga(url, site);
        return NextResponse.json({ success: !!mangaId, mangaId });

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }
        
        const results = await scrapeService.searchAllSites(query);
        return NextResponse.json({ results });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}