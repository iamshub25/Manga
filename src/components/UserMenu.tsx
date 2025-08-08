'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
          ) : (
            <span className="text-sm font-bold">{user.username[0].toUpperCase()}</span>
          )}
        </div>
        <span className="hidden md:block">{user.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <Link
              href="/profile"
              className="block px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              👤 Profile
            </Link>
            <Link
              href="/library"
              className="block px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              📚 My Library
            </Link>
            <Link
              href="/reading-lists"
              className="block px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              📋 Reading Lists
            </Link>
            <Link
              href="/history"
              className="block px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              📖 Reading History
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <hr className="border-gray-700 my-2" />
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}