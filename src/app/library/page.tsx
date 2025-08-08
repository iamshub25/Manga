'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import MangaCard from '@/components/MangaCard';
import Link from 'next/link';

export default function LibraryPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const tabs = [
    { key: 'all', label: '📚 All', count: bookmarks.length },
    { key: 'reading', label: '📖 Reading', count: bookmarks.filter(b => b.status === 'reading').length },
    { key: 'completed', label: '✅ Completed', count: bookmarks.filter(b => b.status === 'completed').length },
    { key: 'plan_to_read', label: '📋 Plan to Read', count: bookmarks.filter(b => b.status === 'plan_to_read').length },
    { key: 'on_hold', label: '⏸️ On Hold', count: bookmarks.filter(b => b.status === 'on_hold').length },
    { key: 'dropped', label: '❌ Dropped', count: bookmarks.filter(b => b.status === 'dropped').length }
  ];

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookmarks = activeTab === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.status === activeTab);

  if (!user) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">📚 My Library</h1>
          <p className="text-gray-400 mb-6">Please login to view your library</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📚 My Library</h1>
          <p className="text-gray-400">Manage your manga collection</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{bookmarks.length}</div>
            <div className="text-gray-400 text-sm">Total Manga</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {bookmarks.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {bookmarks.filter(b => b.status === 'reading').length}
            </div>
            <div className="text-gray-400 text-sm">Reading</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {bookmarks.filter(b => b.status === 'plan_to_read').length}
            </div>
            <div className="text-gray-400 text-sm">Plan to Read</div>
          </div>
        </div>

        {filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark._id} className="relative">
                <MangaCard
                  id={bookmark.manga._id}
                  title={bookmark.manga.title}
                  cover={bookmark.manga.cover}
                  rating={bookmark.rating || bookmark.manga.rating}
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {tabs.find(t => t.key === bookmark.status)?.label.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'all' ? 'No manga in your library' : `No ${activeTab.replace('_', ' ')} manga`}
            </h3>
            <p className="text-gray-400 mb-6">
              Start building your collection by bookmarking manga you want to read
            </p>
            <Link
              href="/manga"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Manga
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}