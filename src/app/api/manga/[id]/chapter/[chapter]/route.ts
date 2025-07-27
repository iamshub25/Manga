import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; chapter: string }> }) {
  try {
    const { chapter } = await params;
    
    // Get chapter info
    const chapterResponse = await fetch(`https://api.mangadex.org/chapter/${chapter}`);
    const chapterData = await chapterResponse.json();
    
    if (!chapterData.data) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    // Get chapter pages
    const pagesResponse = await fetch(`https://api.mangadex.org/at-home/server/${chapter}`);
    const pagesData = await pagesResponse.json();
    

    
    if (!pagesData.baseUrl || !pagesData.chapter) {
      return NextResponse.json({ error: 'Chapter pages not available' }, { status: 404 });
    }
    
    // Use data-saver for faster loading
    const imageFiles = pagesData.chapter.dataSaver || pagesData.chapter.data || [];
    const pages = imageFiles.map((filename: string, index: number) => ({
      number: index + 1,
      image: `${pagesData.baseUrl}/data-saver/${pagesData.chapter.hash}/${filename}`
    }));
    
    const result = {
      id: chapter,
      title: chapterData.data.attributes.title || `Chapter ${chapterData.data.attributes.chapter}`,
      mangaTitle: 'Manga', // Will need manga title from separate call if needed
      pages
    };
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chapter pages' }, { status: 500 });
  }
}