import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';

function checkAuth(request: NextRequest) {
  const auth = request.cookies.get('admin-auth');
  return auth?.value === 'true';
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { mangaId, cover, title } = await request.json();
    await dbConnect();
    
    const updateData: any = {};
    if (cover) updateData.cover = cover;
    if (title) {
      updateData.title = title;
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    
    await Manga.findByIdAndUpdate(mangaId, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { mangaId } = await request.json();
    await dbConnect();
    
    const manga = await Manga.findById(mangaId);
    if (!manga || !manga.sources?.[0]?.url) {
      return NextResponse.json({ error: 'Manga not found or no source URL' }, { status: 404 });
    }

    // Re-scrape manga data
    const { ScrapeService } = await import('@/lib/scrapeService');
    const scrapeService = new ScrapeService();
    await scrapeService.scrapeManga(manga.sources[0].url, manga.sources[0].site);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { mangaId } = await request.json();
    await dbConnect();
    
    await Manga.findByIdAndDelete(mangaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}