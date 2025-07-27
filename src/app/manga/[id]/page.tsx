'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function MangaDetail() {
  const params = useParams();
  const id = params.id as string;
  const [manga, setManga] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const chaptersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mangaRes, chaptersRes] = await Promise.all([
          fetch(`/api/manga/${id}`),
          fetch(`/api/manga/${id}/chapters`)
        ]);
        const mangaData = await mangaRes.json();
        const chaptersData = await chaptersRes.json();
        
        setManga(mangaData);
        const validChapters = Array.isArray(chaptersData) ? chaptersData : [];
        setChapters(validChapters);
        setFilteredChapters(validChapters);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedLanguage === 'all') {
      setFilteredChapters(chapters);
    } else {
      setFilteredChapters(chapters.filter(chapter => chapter.language === selectedLanguage));
    }
    setCurrentPage(1); // Reset to first page when language changes
  }, [selectedLanguage, chapters]);

  const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);
  const startIndex = (currentPage - 1) * chaptersPerPage;
  const currentChapters = filteredChapters.slice(startIndex, startIndex + chaptersPerPage);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (!manga) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Manga not found</div>;
  }

  const availableLanguages = [...new Set(chapters.map(chapter => chapter.language))].filter(Boolean);

  if (!Array.isArray(chapters)) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Error loading chapters</div>;
  }

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
                sizes="(max-width: 1024px) 100vw, 33vw"
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

            {filteredChapters.length > 0 && (
              <Link
                href={`/manga/${id}/chapter/${filteredChapters[0].id}`}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4 text-sm sm:text-base text-center block"
              >
                Read First Chapter
              </Link>
            )}
            <button className="w-full bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors mt-2 text-sm sm:text-base">
              Add to Favorites
            </button>
          </div>
        </div>

        {/* Description and Chapters */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="text-gray-700 leading-relaxed break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
              {manga.description}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Chapters</h2>
              <div className="flex gap-2">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="en">English</option>
                  <option value="all">All Languages</option>
                  {availableLanguages.filter(lang => lang !== 'en').map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  All Chapters
                </button>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Latest First</option>
                  <option>Oldest First</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {currentChapters.length > 0 ? currentChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${id}/chapter/${chapter.id}`}
                  className="flex justify-between items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{chapter.title}</div>
                    <div className="text-xs text-gray-500">{chapter.language?.toUpperCase()} • {chapter.pages} pages</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{chapter.date}</div>
                </Link>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  No chapters available for this manga
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 sm:mt-6 gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Next
                </button>
                
                <span className="text-xs sm:text-sm text-gray-500 ml-2">
                  Page {currentPage} of {totalPages} ({filteredChapters.length} chapters)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}