import MangaCard from "@/components/MangaCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

async function getManga() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/manga?sort=latest`, { cache: 'no-store' });
  return res.json();
}

export default async function Home() {
  const allManga = await getManga();
  const featuredManga = Array.isArray(allManga) ? allManga.slice(0, 6) : [];
  const latestUpdates = Array.isArray(allManga) ? allManga.slice(0, 8) : [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
            Read Manga Online
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 opacity-90">
            Discover thousands of manga titles for free
          </p>
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Manga */}
      <section className="mb-8 sm:mb-12">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Featured Manga</h2>
          <Link href="/manga" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredManga.map((manga) => (
            <MangaCard key={manga.id} {...manga} />
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="mb-8 sm:mb-12">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Latest Updates</h2>
          <Link href="/latest" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {latestUpdates.map((manga) => (
            <MangaCard key={manga.id} {...manga} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Browse by Genre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {["Action", "Romance", "Comedy", "Drama", "Fantasy", "Horror", "Slice of Life", "Sports", "Supernatural", "Thriller", "Adventure", "Mystery"].map((genre) => (
            <Link
              key={genre}
              href={`/manga?genre=${encodeURIComponent(genre)}`}
              className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center font-medium text-gray-700 hover:text-blue-600 text-sm sm:text-base block"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}