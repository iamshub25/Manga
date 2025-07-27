import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art&includes[]=author`);
    const data = await response.json();
    
    const manga = data.data.map((item: { id: string; attributes: { title: { en?: string; [key: string]: string }; lastChapter: string; rating: number; status: string; tags: { attributes: { group: string; name: { en: string } } }[] }; relationships: { type: string; attributes: { fileName?: string; name?: string } }[] }) => {
      const coverArt = item.relationships.find((rel: { type: string }) => rel.type === 'cover_art');
      const author = item.relationships.find((rel: { type: string }) => rel.type === 'author');
      
      return {
        id: item.id,
        title: item.attributes.title.en || Object.values(item.attributes.title)[0],
        cover: coverArt ? `https://uploads.mangadex.org/covers/${item.id}/${coverArt.attributes.fileName}` : 'https://via.placeholder.com/300x400',
        latestChapter: item.attributes.lastChapter || 'N/A',
        rating: item.attributes.rating || 0,
        author: author?.attributes?.name || 'Unknown',
        status: item.attributes.status,
        genres: item.attributes.tags?.filter((tag: { attributes: { group: string } }) => tag.attributes.group === 'genre').map((tag: { attributes: { name: { en: string } } }) => tag.attributes.name.en).slice(0, 3) || []
      };
    });
    
    return NextResponse.json(manga);
  } catch {
    return NextResponse.json({ error: 'Failed to search manga' }, { status: 500 });
  }
}