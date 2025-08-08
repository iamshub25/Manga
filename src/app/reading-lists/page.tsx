'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function ReadingListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  const fetchLists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reading-lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">📋 Reading Lists</h1>
          <p className="text-gray-400 mb-6">Please login to view your reading lists</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">📋 Reading Lists</h1>
          <p className="text-gray-400">Organize your manga collection</p>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-2">No reading lists yet</h3>
          <p className="text-gray-400 mb-6">Create custom lists to organize your manga</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Create List
          </button>
        </div>
      </div>
    </div>
  );
}