'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

interface Page {
  number: number;
  image: string;
}

interface ChapterReaderProps {
  mangaId: string;
  chapterNumber: string;
  pages: Page[];
  nextChapter?: string;
  prevChapter?: string;
  mangaSlug: string;
}

export default function ChapterReader({ 
  mangaId, 
  chapterNumber, 
  pages, 
  nextChapter, 
  prevChapter,
  mangaSlug 
}: ChapterReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [readingMode, setReadingMode] = useState<'single' | 'double' | 'webtoon'>('single');
  const [autoScroll, setAutoScroll] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const { user } = useUser();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
  }, []);

  useEffect(() => {
    if (user) {
      updateProgress();
    }
  }, [currentPage, user]);

  useEffect(() => {
    preloadImages();
  }, [currentPage]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          prevPage();
          break;
        case 'ArrowRight':
        case 'd':
          nextPage();
          break;
        case 'ArrowUp':
        case 'w':
          if (readingMode === 'webtoon') {
            window.scrollBy(0, -200);
          }
          break;
        case 'ArrowDown':
        case 's':
          if (readingMode === 'webtoon') {
            window.scrollBy(0, 200);
          }
          break;
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, readingMode]);

  const updateProgress = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mangaId,
          chapterNumber,
          pageNumber: currentPage,
          totalPages: pages.length
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const preloadImages = () => {
    const toPreload = [currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
      .filter(page => page > 0 && page <= pages.length && !preloadedImages.has(page));

    toPreload.forEach(pageNum => {
      const img = new window.Image();
      img.src = pages[pageNum - 1]?.image;
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, pageNum]));
      };
    });
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(prev => prev + 1);
    } else if (nextChapter) {
      window.location.href = `/manga/${mangaSlug}/chapter/${nextChapter}`;
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (prevChapter) {
      window.location.href = `/manga/${mangaSlug}/chapter/${prevChapter}`;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    
    if (clickX < centerX) {
      prevPage();
    } else {
      nextPage();
    }
  };

  if (readingMode === 'webtoon') {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          {pages.map((page, index) => (
            <div key={page.number} className="relative">
              <Image
                src={page.image}
                alt={`Page ${page.number}`}
                width={800}
                height={1200}
                className="w-full h-auto"
                priority={index < 3}
              />
            </div>
          ))}
        </div>
        
        <ReaderControls
          currentPage={currentPage}
          totalPages={pages.length}
          readingMode={readingMode}
          setReadingMode={setReadingMode}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          showControls={showControls}
          setShowControls={setShowControls}
          nextChapter={nextChapter}
          prevChapter={prevChapter}
          mangaSlug={mangaSlug}
        />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full">
          {readingMode === 'double' && currentPage < pages.length ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Image
                  src={pages[currentPage - 1]?.image}
                  alt={`Page ${currentPage}`}
                  width={400}
                  height={600}
                  className="w-full h-auto cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
              <div className="flex-1">
                <Image
                  src={pages[currentPage]?.image}
                  alt={`Page ${currentPage + 1}`}
                  width={400}
                  height={600}
                  className="w-full h-auto cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
            </div>
          ) : (
            <Image
              src={pages[currentPage - 1]?.image}
              alt={`Page ${currentPage}`}
              width={800}
              height={1200}
              className="w-full h-auto cursor-pointer"
              onClick={handleImageClick}
            />
          )}
        </div>
      </div>

      <ReaderControls
        currentPage={currentPage}
        totalPages={pages.length}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        showControls={showControls}
        setShowControls={setShowControls}
        nextChapter={nextChapter}
        prevChapter={prevChapter}
        mangaSlug={mangaSlug}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  readingMode: 'single' | 'double' | 'webtoon';
  setReadingMode: (mode: 'single' | 'double' | 'webtoon') => void;
  autoScroll: boolean;
  setAutoScroll: (auto: boolean) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  nextChapter?: string;
  prevChapter?: string;
  mangaSlug: string;
  onPageChange?: (page: number) => void;
}

function ReaderControls({
  currentPage,
  totalPages,
  readingMode,
  setReadingMode,
  autoScroll,
  setAutoScroll,
  showControls,
  setShowControls,
  nextChapter,
  prevChapter,
  mangaSlug,
  onPageChange
}: ReaderControlsProps) {
  if (!showControls) {
    return (
      <button
        onClick={() => setShowControls(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowControls(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">
              {currentPage} / {totalPages}
            </span>
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => onPageChange?.(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={readingMode}
            onChange={(e) => setReadingMode(e.target.value as any)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            <option value="single">Single Page</option>
            <option value="double">Double Page</option>
            <option value="webtoon">Webtoon</option>
          </select>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded ${autoScroll ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          >
            🔄
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {prevChapter && (
            <a
              href={`/manga/${mangaSlug}/chapter/${prevChapter}`}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
            >
              ← Prev Chapter
            </a>
          )}
          
          {nextChapter && (
            <a
              href={`/manga/${mangaSlug}/chapter/${nextChapter}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            >
              Next Chapter →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}