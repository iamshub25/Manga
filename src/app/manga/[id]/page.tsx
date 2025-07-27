import Image from "next/image";
import Link from "next/link";

interface MangaDetailProps {
  params: Promise<{ id: string }>;
}

async function getMangaDetail(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/manga/${id}`, { cache: 'no-store' });
  return res.json();
}

async function getChapters(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/manga/${id}/chapters`, { cache: 'no-store' });
  return res.json();
}

export default async function MangaDetail({ params }: MangaDetailProps) {
  const { id } = await params;
  const manga = await getMangaDetail(id);
  const chapters = await getChapters(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Manga Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="relative aspect-[3/4] mb-4">
              <Image
                src={manga.cover}
                alt={manga.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{manga.title}</h1>
            <div className="flex items-center mb-4">
              <span className="text-yellow-500">★★★★★</span>
              <span className="ml-2 text-gray-600">{manga.rating}/10</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Author:</span> {manga.author}</div>
              <div><span className="font-semibold">Status:</span> {manga.status}</div>
              <div><span className="font-semibold">Genres:</span> {Array.isArray(manga.genres) && manga.genres.length > 0 ? manga.genres.join(', ') : 'N/A'}</div>
              <div><span className="font-semibold">Updated:</span> {manga.updated}</div>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4 text-sm sm:text-base">
              Read First Chapter
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors mt-2 text-sm sm:text-base">
              Add to Favorites
            </button>
          </div>
        </div>

        {/* Description and Chapters */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {manga.description}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Chapters</h2>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto">
                <option>Latest First</option>
                <option>Oldest First</option>
              </select>
            </div>

            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${id}/chapter/${chapter.id}`}
                  className="flex justify-between items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{chapter.title}</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{chapter.date}</div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 sm:mt-6">
              <div className="flex space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">Previous</button>
                <button className="px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm">1</button>
                <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">2</button>
                <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">3</button>
                <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}