import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`https://api.mangadex.org/manga/${id}/feed?limit=500&order[chapter]=desc`);
    
    if (!response.ok) {
      return NextResponse.json([]);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json([]);
    }
    
    const chapters = data.data
      .filter((item: { attributes: { chapter: string; pages: number } }) => {
        return item.attributes && item.attributes.chapter && item.attributes.pages >= 0;
      })
      .map((item: { id: string; attributes: { chapter: string; title: string; publishAt: string; pages: number; translatedLanguage: string } }) => ({
        id: item.id,
        number: item.attributes.chapter,
        title: item.attributes.title || `Chapter ${item.attributes.chapter}`,
        date: new Date(item.attributes.publishAt).toLocaleDateString(),
        pages: item.attributes.pages || 0,
        language: item.attributes.translatedLanguage
      }));
    
    return NextResponse.json(chapters);
  } catch {
    return NextResponse.json([]);
  }
}