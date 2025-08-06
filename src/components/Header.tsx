'use client';

import { useState } from 'react';
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-400">
            MangaCap
          </Link>
          
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-gray-300 hover:text-blue-400 text-sm lg:text-base transition-colors">Home</Link>
            <Link href="/manga" className="text-gray-300 hover:text-blue-400 text-sm lg:text-base transition-colors">Manga</Link>
            <Link href="/latest" className="text-gray-300 hover:text-blue-400 text-sm lg:text-base transition-colors">Latest</Link>
            <Link href="/popular" className="text-gray-300 hover:text-blue-400 text-sm lg:text-base transition-colors">Popular</Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <SearchBar className="w-48 lg:w-64" />
            </div>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/manga" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Manga</Link>
              <Link href="/latest" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Latest</Link>
              <Link href="/popular" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Popular</Link>
              <div className="px-3 py-2 sm:hidden">
                <SearchBar className="w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}