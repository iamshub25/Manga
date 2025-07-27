import MangaCard from '@/components/MangaCard';

async function getLatestManga() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/manga?sort=latest`, { cache: 'no-store' });
    
    if (!res.ok) {
      return [];
    }
    
    return res.json();
  } catch {
    return [];
  }
}

export default async function LatestPage() {
  const manga = await getLatestManga();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Latest Updates</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.isArray(manga) ? manga.map((item: { id: string; title: string; cover: string; latestChapter: string; rating: number }) => (
          <MangaCard key={item.id} {...item} />
        )) : null}
      </div>
    </div>
  );
}