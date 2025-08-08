'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

interface BookmarkButtonProps {
  mangaId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({ mangaId, size = 'md' }: BookmarkButtonProps) {
  const [bookmark, setBookmark] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { user } = useUser();

  const statuses = [
    { key: 'plan_to_read', label: '📋 Plan to Read', color: 'text-gray-400' },
    { key: 'reading', label: '📖 Reading', color: 'text-blue-400' },
    { key: 'completed', label: '✅ Completed', color: 'text-green-400' },
    { key: 'on_hold', label: '⏸️ On Hold', color: 'text-yellow-400' },
    { key: 'dropped', label: '❌ Dropped', color: 'text-red-400' }
  ];

  useEffect(() => {
    if (user) {
      fetchBookmark();
    }
  }, [user, mangaId]);

  const fetchBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookmarks/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmark(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookmark:', error);
    }
  };

  const updateBookmark = async (status: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mangaId, status })
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookmark(data);
        setShowStatusMenu(false);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async () => {
    if (!user || !bookmark) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookmarks/${mangaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setBookmark(null);
        setShowStatusMenu(false);
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const currentStatus = bookmark ? statuses.find(s => s.key === bookmark.status) : null;
  const sizeClasses = {
    sm: 'text-sm p-1',
    md: 'text-base p-2',
    lg: 'text-lg p-3'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowStatusMenu(!showStatusMenu)}
        disabled={loading}
        className={`${sizeClasses[size]} bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors disabled:opacity-50 ${
          bookmark ? currentStatus?.color : 'text-gray-400'
        }`}
      >
        {loading ? '⏳' : bookmark ? currentStatus?.label : '🔖 Add to Library'}
      </button>

      {showStatusMenu && (
        <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 min-w-max">
          <div className="p-2">
            {statuses.map((status) => (
              <button
                key={status.key}
                onClick={() => updateBookmark(status.key)}
                className={`block w-full text-left px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors ${status.color}`}
              >
                {status.label}
              </button>
            ))}
            {bookmark && (
              <>
                <hr className="border-gray-700 my-2" />
                <button
                  onClick={removeBookmark}
                  className="block w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  🗑️ Remove
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}