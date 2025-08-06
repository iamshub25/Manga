'use client';

import { useState, useEffect } from 'react';
import MangaCard from "@/components/MangaCard";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/Loader";
import Link from "next/link";

export default function Home() {
  const [allManga, setAllManga] = useState<{ _id: string; title: string; cover: string; slug: string; rating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch('/api/manga?sort=updatedAt&limit=20');
        if (res.ok) {
          const data = await res.json();
          setAllManga(data.mangas || []);
        }
      } catch (error) {
        console.error('Failed to fetch manga:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManga();
  }, []);
  
  const featuredManga = allManga.slice(0, 6);
  const latestUpdates = allManga.slice(0, 8);
  
  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading manga...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                MangaCap
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-blue-100">
                Your ultimate manga reading destination
              </p>
              <div className="max-w-md">
                <SearchBar />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">{allManga.length}</div>
              <div className="text-gray-400">Manga</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-400">24/7</div>
              <div className="text-gray-400">Available</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">Free</div>
              <div className="text-gray-400">Always</div>
            </div>
          </div>
        </section>

        {/* Featured Manga */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">🔥 Trending Now</h2>
            <Link href="/manga" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredManga.map((manga) => (
              <MangaCard key={manga._id} id={manga._id} title={manga.title} cover={manga.cover} rating={manga.rating} />
            ))}
          </div>
        </section>

        {/* Latest Updates */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">📚 Latest Updates</h2>
            <Link href="/latest" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestUpdates.map((manga) => (
              <MangaCard key={manga._id} id={manga._id} title={manga.title} cover={manga.cover} rating={manga.rating} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">🎭 Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {["Action", "Romance", "Comedy", "Drama", "Fantasy", "Horror", "Slice of Life", "Sports", "Supernatural", "Thriller", "Adventure", "Mystery"].map((genre) => (
              <Link
                key={genre}
                href={`/manga?genre=${encodeURIComponent(genre)}`}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500 p-4 rounded-xl transition-all duration-200 text-center font-medium text-gray-300 hover:text-blue-400 group"
              >
                <div className="group-hover:scale-105 transition-transform">{genre}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}