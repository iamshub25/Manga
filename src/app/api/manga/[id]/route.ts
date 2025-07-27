import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author`);
    const data = await response.json();
    
    if (!data.data) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    const item = data.data;
    const coverArt = item.relationships.find((rel: any) => rel.type === 'cover_art');
    const author = item.relationships.find((rel: any) => rel.type === 'author');
    
    const manga = {
      id: item.id,
      title: item.attributes.title.en || Object.values(item.attributes.title)[0],
      cover: coverArt ? `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes.fileName}` : 'https://via.placeholder.com/300x400',
      rating: item.attributes.rating || 0,
      author: author?.attributes?.name || 'Unknown',
      status: item.attributes.status,
      genres: item.attributes.tags?.filter((tag: any) => tag.attributes.group === 'genre').map((tag: any) => tag.attributes.name.en).filter(Boolean) || [],
      description: item.attributes.description.en || Object.values(item.attributes.description)[0] || 'No description available',
      updated: item.attributes.updatedAt
    };
    
    return NextResponse.json(manga);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manga details' }, { status: 500 });
  }
}