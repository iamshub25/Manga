import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`https://api.mangadex.org/manga/${id}/feed?limit=100&order[chapter]=desc&translatedLanguage[]=en`);
    const data = await response.json();
    
    const chapters = data.data.map((item: any) => ({
      id: item.id,
      number: item.attributes.chapter,
      title: item.attributes.title || `Chapter ${item.attributes.chapter}`,
      date: new Date(item.attributes.publishAt).toLocaleDateString(),
      pages: item.attributes.pages
    }));
    
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}