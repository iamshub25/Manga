import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'latest';
    
    let url = 'https://api.mangadex.org/manga?limit=20&includes[]=cover_art&includes[]=author&availableTranslatedLanguage[]=en';
    
    // Add sorting
    switch (sort) {
      case 'latest':
        url += '&order[updatedAt]=desc';
        break;
      case 'popular':
        url += '&order[followedCount]=desc';
        break;
      case 'rating':
        url += '&order[rating]=desc';
        break;
      case 'title':
        url += '&order[title]=asc';
        break;
    }
    
    // Add status filter
    if (status) {
      url += `&status[]=${status}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    const manga = data.data.map((item: any) => {
      const coverArt = item.relationships.find((rel: any) => rel.type === 'cover_art');
      const author = item.relationships.find((rel: any) => rel.type === 'author');
      
      return {
        id: item.id,
        title: item.attributes.title.en || Object.values(item.attributes.title)[0],
        cover: coverArt ? `https://uploads.mangadex.org/covers/${item.id}/${coverArt.attributes.fileName}` : 'https://via.placeholder.com/300x400',
        latestChapter: item.attributes.lastChapter || 'N/A',
        rating: item.attributes.rating || 0,
        author: author?.attributes?.name || 'Unknown',
        status: item.attributes.status,
        genres: item.attributes.tags?.filter((tag: any) => tag.attributes.group === 'genre').map((tag: any) => tag.attributes.name.en).slice(0, 3) || [],
        updatedAt: item.attributes.updatedAt
      };
    });
    
    return NextResponse.json(manga);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manga' }, { status: 500 });
  }
}