import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';
import { ScrapeService } from '@/lib/scrapeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'updatedAt';
    const order = searchParams.get('order') || 'desc';
    const genre = searchParams.get('genre');
    const status = searchParams.get('status');

    await dbConnect();

    const query: any = {};
    if (genre) query.genres = { $in: [genre] };
    if (status) query.status = status;

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [mangas, total] = await Promise.all([
      Manga.find(query)
        .select('title slug author genres summary cover status rating views updatedAt')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Manga.countDocuments(query)
    ]);

    return NextResponse.json({
      mangas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Manga API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, site } = await request.json();
    
    if (!url || !site) {
      return NextResponse.json({ error: 'URL and site are required' }, { status: 400 });
    }

    const scrapeService = new ScrapeService();
    const mangaId = await scrapeService.scrapeManga(url, site);

    if (!mangaId) {
      return NextResponse.json({ error: 'Failed to scrape manga' }, { status: 500 });
    }

    return NextResponse.json({ success: true, mangaId });
  } catch (error) {
    console.error('Scrape manga error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}