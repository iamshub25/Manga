'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [url, setUrl] = useState('');
  const [site, setSite] = useState('mgeko');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const scrapeManga = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manga', url, site })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Manga scraped successfully!');
        setUrl('');
      } else {
        alert('Failed to scrape manga');
      }
    } catch (error) {
      alert('Error scraping manga');
    }
    setLoading(false);
  };

  const searchManga = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      });
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      alert('Error searching manga');
    }
    setLoading(false);
  };

  const scrapeFromResult = async (mangaUrl: string, mangaSite: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manga', url: mangaUrl, site: mangaSite })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Manga scraped successfully!');
      }
    } catch (error) {
      alert('Error scraping manga');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Admin Panel - Manga Scraper</h2>
      
      {/* Direct Scraping */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Scrape Manga Directly</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Manga URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="mgeko">Mgeko</option>
          </select>
          <button
            onClick={scrapeManga}
            disabled={loading || !url}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
      </div>

      {/* Search and Scrape */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Search and Scrape</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search manga..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={searchManga}
            disabled={loading || !query}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="grid gap-4">
            <h4 className="font-semibold">Search Results:</h4>
            {results.map((manga, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h5 className="font-medium">{manga.title}</h5>
                  <p className="text-sm text-gray-600">{manga.author}</p>
                  <p className="text-xs text-gray-500">Site: {manga.site}</p>
                </div>
                <button
                  onClick={() => scrapeFromResult(manga.url, manga.site)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Scrape
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}