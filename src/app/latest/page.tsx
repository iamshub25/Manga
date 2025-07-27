import MangaCard from '@/components/MangaCard';

async function getLatestManga() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/manga?sort=latest`, { cache: 'no-store' });
  return res.json();
}

export default async function LatestPage() {
  const manga = await getLatestManga();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Latest Updates</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {manga.map((item: any) => (
          <MangaCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}