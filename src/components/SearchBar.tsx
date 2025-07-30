'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const cache = new Map();

export default function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = async (q: string) => {
    if (cache.has(q)) {
      setSuggestions(cache.get(q));
      return;
    }

    try {
      const res = await fetch(`/api/manga/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      cache.set(q, data);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (query.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search manga..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] mt-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSearch(suggestion);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black border-b last:border-b-0"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}