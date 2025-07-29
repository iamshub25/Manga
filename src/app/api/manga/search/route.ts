import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';
import { ScrapeService } from '@/lib/scrapeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const source = searchParams.get('source') || 'database';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (source === 'live') {
      // Search from live sources
      const scrapeService = new ScrapeService();
      const results = await scrapeService.searchAllSites(query);
      return NextResponse.json(results);
    }

    // Search from database
    await dbConnect();
    
    const mangas = await Manga.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genres: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .select('title slug author genres summary cover status rating views')
    .limit(20)
    .sort({ views: -1 });

    return NextResponse.json(mangas);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}