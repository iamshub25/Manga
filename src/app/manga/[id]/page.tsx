'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function MangaDetail() {
  const params = useParams();
  const id = params.id as string;
  const [manga, setManga] = useState<{ id: string; title: string; cover: string; rating: number; author: string; status: string; genres: string[]; description: string; updated: string } | null>(null);
  const [chapters, setChapters] = useState<{ _id: string; number: string; title: string; createdAt: string; pages: { number: number; image: string }[]; language: string }[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<{ _id: string; number: string; title: string; createdAt: string; pages: { number: number; image: string }[]; language: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
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
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let filtered = selectedLanguage === 'all' 
      ? chapters 
      : chapters.filter(chapter => chapter.language === selectedLanguage);
    
    filtered = filtered.sort((a, b) => {
      const aNum = parseFloat(a.number) || 0;
      const bNum = parseFloat(b.number) || 0;
      return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
    });
    
    setFilteredChapters(filtered);
    setCurrentPage(1);
  }, [selectedLanguage, sortOrder, chapters]);

  const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);
  const startIndex = (currentPage - 1) * chaptersPerPage;
  const currentChapters = filteredChapters.slice(startIndex, startIndex + chaptersPerPage);

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

  if (!manga) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-gray-300 text-xl">Manga not found</p>
        </div>
      </div>
    );
  }

  const availableLanguages = [...new Set(chapters.map(chapter => chapter.language))].filter(Boolean);

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-md p-4 sm:p-6">
              <div className="relative aspect-[3/4] mb-4">
                {manga.cover ? (
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-full h-full object-cover rounded-lg"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) nextElement.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 ${manga.cover ? 'hidden' : 'flex'}`}>
                  No Image
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{manga.title}</h1>
              <div className="flex items-center mb-4">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-2 text-gray-300">{manga.rating}/10</span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div><span className="font-semibold text-white">Author:</span> {manga.author}</div>
                <div><span className="font-semibold text-white">Status:</span> {manga.status}</div>
                <div><span className="font-semibold text-white">Genres:</span> {Array.isArray(manga.genres) && manga.genres.length > 0 ? manga.genres.join(', ') : 'N/A'}</div>
                <div><span className="font-semibold text-white">Updated:</span> {manga.updated}</div>
              </div>

              {filteredChapters.length > 0 && (
                <Link
                  href={`/manga/${id}/chapter/${filteredChapters[0]._id}`}
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4 text-sm sm:text-base text-center block"
                >
                  Read First Chapter
                </Link>
              )}
              <button className="w-full bg-gray-700 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors mt-2 text-sm sm:text-base">
                Add to Favorites
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Description</h2>
              <div className="text-gray-300 leading-relaxed break-words" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                {manga.description}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-md p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3">Chapters</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm flex-1 sm:flex-none"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English</option>
                    {availableLanguages.filter(lang => lang !== 'en').map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm flex-1 sm:flex-none"
                  >
                    <option value="desc">Latest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <button
                    onClick={() => setSelectedLanguage('all')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex-1 sm:flex-none"
                  >
                    All Chapters
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {currentChapters.length > 0 ? currentChapters.map((chapter) => (
                  <Link
                    key={chapter._id}
                    href={`/manga/${id}/chapter/${chapter._id}`}
                    className="flex justify-between items-center p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">{chapter.title}</div>
                      <div className="text-xs text-gray-400">{chapter.language?.toUpperCase()} • {chapter.pages?.length || 0} pages</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{new Date(chapter.createdAt).toLocaleDateString()}</div>
                  </Link>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    No chapters available for this manga
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6">
                  <div className="flex justify-center items-center gap-1 sm:gap-2 mb-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      Prev
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm min-w-[32px] ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
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
                      className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="text-center text-xs sm:text-sm text-gray-400">
                    Page {currentPage} of {totalPages} ({filteredChapters.length} chapters)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}