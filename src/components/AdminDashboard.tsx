'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('scraper');
  const [chapters, setChapters] = useState<any[]>([]);
  const [groupedChapters, setGroupedChapters] = useState<{[key: string]: any[]}>({});
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');

  // Scraper state
  const [url, setUrl] = useState('');
  const [site, setSite] = useState('mgeko');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'chapters') {
      fetchChapters();
    }
  }, [activeTab]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/chapters');
      const data = await response.json();
      setChapters(data);
      
      // Group chapters by manga
      const grouped = data.reduce((acc: any, chapter: any) => {
        const mangaTitle = chapter.mangaId?.title || 'Unknown Manga';
        if (!acc[mangaTitle]) acc[mangaTitle] = [];
        acc[mangaTitle].push(chapter);
        return acc;
      }, {});
      setGroupedChapters(grouped);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
    setLoading(false);
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm('Delete this chapter?')) return;
    
    try {
      const response = await fetch('/api/admin/chapters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId })
      });
      
      if (response.ok) {
        setChapters(chapters.filter(ch => ch._id !== chapterId));
        setSelectedChapters(prev => {
          const newSet = new Set(prev);
          newSet.delete(chapterId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const deleteSelectedChapters = async () => {
    if (selectedChapters.size === 0) return;
    if (!confirm(`Delete ${selectedChapters.size} selected chapters?`)) return;
    
    try {
      const response = await fetch('/api/admin/chapters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterIds: Array.from(selectedChapters) })
      });
      
      if (response.ok) {
        setChapters(chapters.filter(ch => !selectedChapters.has(ch._id)));
        setSelectedChapters(new Set());
      }
    } catch (error) {
      console.error('Error deleting chapters:', error);
    }
  };

  const toggleChapterSelection = (chapterId: string) => {
    setSelectedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const selectAllChapters = () => {
    const allIds = chapters.map(ch => ch._id);
    setSelectedChapters(new Set(allIds));
  };

  const deselectAllChapters = () => {
    setSelectedChapters(new Set());
  };

  const toggleFolder = (mangaTitle: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mangaTitle)) {
        newSet.delete(mangaTitle);
      } else {
        newSet.add(mangaTitle);
      }
      return newSet;
    });
  };

  const deleteMangaFolder = async (mangaTitle: string) => {
    const mangaChapters = groupedChapters[mangaTitle] || [];
    if (!confirm(`Delete "${mangaTitle}" manga and all ${mangaChapters.length} chapters?`)) return;
    
    const chapterIds = mangaChapters.map(ch => ch._id);
    const mangaId = mangaChapters[0]?.mangaId;
    
    try {
      // Delete chapters first
      const chaptersResponse = await fetch('/api/admin/chapters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterIds })
      });
      
      // Delete manga from database
      if (chaptersResponse.ok && mangaId) {
        await fetch('/api/admin/manga', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mangaId })
        });
      }
      
      if (chaptersResponse.ok) {
        setChapters(chapters.filter(ch => !chapterIds.includes(ch._id)));
        setSelectedChapters(prev => {
          const newSet = new Set(prev);
          chapterIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting manga folder:', error);
    }
  };

  const updateCover = async (mangaId: string) => {
    const choice = confirm('Upload from device? (OK = Upload file, Cancel = Enter URL)');
    
    if (choice) {
      // File upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mangaId', mangaId.toString());
        
        try {
          const uploadResponse = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
          });
          
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            alert('Cover uploaded successfully!');
            fetchChapters(); // Refresh to show new cover
          } else {
            alert(`Upload failed: ${uploadData.error}`);
          }
        } catch (error) {
          console.error('Error uploading cover:', error);
        }
      };
      input.click();
    } else {
      // URL input
      const coverUrl = prompt('Enter new cover image URL:');
      if (!coverUrl) return;
      
      try {
        const response = await fetch('/api/admin/manga', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mangaId, cover: coverUrl })
        });
        
        if (response.ok) {
          alert('Cover updated successfully!');
        }
      } catch (error) {
        console.error('Error updating cover:', error);
      }
    }
  };

  const rescrapeFolder = async (mangaId: string) => {
    if (!confirm('Re-scrape this manga? This will update chapters and data.')) return;
    
    setLoading(true);
    setScrapeStatus('Re-scraping manga...');
    
    try {
      const response = await fetch('/api/admin/manga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mangaId })
      });
      
      if (response.ok) {
        setScrapeStatus('Re-scrape completed!');
        setTimeout(() => setScrapeStatus(''), 3000);
        fetchChapters(); // Refresh chapter list
      } else {
        setScrapeStatus('Re-scrape failed');
      }
    } catch (error) {
      setScrapeStatus('Error during re-scraping');
    }
    setLoading(false);
  };

  const renameManga = async (mangaId: string, currentTitle: string) => {
    const newTitle = prompt('Enter new manga title:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    
    try {
      const response = await fetch('/api/admin/manga', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mangaId, title: newTitle })
      });
      
      if (response.ok) {
        alert('Manga renamed successfully!');
        fetchChapters(); // Refresh to show new name
      }
    } catch (error) {
      console.error('Error renaming manga:', error);
    }
  };

  const rescrapeAllFolders = async () => {
    const mangaList = Object.entries(groupedChapters);
    if (mangaList.length === 0) return;
    if (!confirm(`Rescrape all ${mangaList.length} manga? This may take a while.`)) return;
    
    setLoading(true);
    let completed = 0;
    
    for (const [mangaTitle, mangaChapters] of mangaList) {
      try {
        setScrapeStatus(`Rescaping ${mangaTitle} (${completed + 1}/${mangaList.length})...`);
        
        const response = await fetch('/api/admin/manga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mangaId: mangaChapters[0]?.mangaId })
        });
        
        if (response.ok) {
          completed++;
        }
      } catch (error) {
        console.error(`Failed to rescrape ${mangaTitle}:`, error);
      }
    }
    
    setScrapeStatus(`Bulk rescrape completed! ${completed}/${mangaList.length} successful`);
    setTimeout(() => setScrapeStatus(''), 5000);
    fetchChapters(); // Refresh chapter list
    setLoading(false);
  };

  const scrapeManga = async () => {
    if (!url) return;
    
    setLoading(true);
    setScrapeStatus('Starting scrape...');
    try {
      setScrapeStatus('Fetching manga details...');
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manga', url, site })
      });
      
      setScrapeStatus('Processing chapters...');
      const data = await response.json();
      if (data.success) {
        setScrapeStatus('Scrape completed successfully!');
        setTimeout(() => setScrapeStatus(''), 3000);
        setUrl('');
      } else {
        setScrapeStatus('Scrape failed');
      }
    } catch (error) {
      setScrapeStatus('Error occurred during scraping');
    }
    setLoading(false);
  };

  const searchManga = async () => {
    if (!query) return;
    
    setLoading(true);
    setScrapeStatus('Searching manga...');
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      });
      
      const data = await response.json();
      setResults(data.results || []);
      setScrapeStatus(`Found ${data.results?.length || 0} results`);
      setTimeout(() => setScrapeStatus(''), 3000);
    } catch (error) {
      setScrapeStatus('Search failed');
    }
    setLoading(false);
  };

  const scrapeAllResults = async () => {
    if (results.length === 0) return;
    if (!confirm(`Scrape all ${results.length} manga? This may take a while.`)) return;
    
    setLoading(true);
    let completed = 0;
    
    for (const manga of results) {
      try {
        setScrapeStatus(`Scraping ${manga.title} (${completed + 1}/${results.length})...`);
        
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'manga', url: manga.url, site: manga.site })
        });
        
        if (response.ok) {
          completed++;
        }
      } catch (error) {
        console.error(`Failed to scrape ${manga.title}:`, error);
      }
    }
    
    setScrapeStatus(`Bulk scrape completed! ${completed}/${results.length} successful`);
    setTimeout(() => setScrapeStatus(''), 5000);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Logout
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-2 sm:space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('scraper')}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base whitespace-nowrap ${activeTab === 'scraper' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Scraper
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base whitespace-nowrap ${activeTab === 'chapters' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Chapters
        </button>
      </div>

      {/* Scraper Tab */}
      {activeTab === 'scraper' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Manga Scraper</h2>
          
          {/* Direct Scraping */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Direct Scraping</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Manga URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="mgeko">Mgeko</option>
                <option value="mangadx">MangaDx</option>
                <option value="mgekojumbo">Mgeko Jumbo</option>
              </select>
              <button
                onClick={scrapeManga}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? 'Scraping...' : 'Scrape'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <h3 className="font-semibold mb-2">Search & Scrape</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Search manga..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <button
                onClick={searchManga}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Status Display */}
            {scrapeStatus && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                {scrapeStatus}
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded">
                  <span className="font-medium">Found {results.length} results</span>
                  <button
                    onClick={scrapeAllResults}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {loading ? 'Scraping All...' : 'Scrape All'}
                  </button>
                </div>
                {results.map((manga, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{manga.title}</h4>
                      <p className="text-sm text-gray-600">{manga.author}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUrl(manga.url);
                        setSite(manga.site);
                        scrapeManga();
                      }}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {loading && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>}
                      {loading ? 'Scraping...' : 'Scrape'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chapters Tab */}
      {activeTab === 'chapters' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chapters Management</h2>
            <div className="flex flex-wrap gap-2">
              {selectedChapters.size > 0 && (
                <>
                  <button
                    onClick={deleteSelectedChapters}
                    className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"
                  >
                    Delete ({selectedChapters.size})
                  </button>
                  <button
                    onClick={deselectAllChapters}
                    className="px-2 sm:px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs sm:text-sm"
                  >
                    Deselect
                  </button>
                </>
              )}
              <button
                onClick={selectedChapters.size === chapters.length ? deselectAllChapters : selectAllChapters}
                className="px-2 sm:px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
              >
                {selectedChapters.size === chapters.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={rescrapeAllFolders}
                disabled={loading || Object.keys(groupedChapters).length === 0}
                className="px-2 sm:px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-xs sm:text-sm flex items-center gap-1"
              >
                {loading && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>}
                Rescrape All
              </button>
              <button
                onClick={fetchChapters}
                className="px-2 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedChapters).map(([mangaTitle, mangaChapters]) => (
                <div key={mangaTitle} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 
                      className="font-bold text-lg text-blue-600 cursor-pointer hover:text-blue-800 flex items-center gap-2"
                      onClick={() => toggleFolder(mangaTitle)}
                    >
                      {expandedFolders.has(mangaTitle) ? '📂' : '📁'} {mangaTitle}
                      <span className="text-sm text-gray-500">({mangaChapters.length} chapters)</span>
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => renameManga(mangaChapters[0]?.mangaId, mangaTitle)}
                        className="px-1 sm:px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 min-w-0 flex-shrink-0"
                        title="Rename manga"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => updateCover(mangaChapters[0]?.mangaId?._id || mangaChapters[0]?.mangaId)}
                        className="px-1 sm:px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 min-w-0 flex-shrink-0"
                        title="Update cover image"
                      >
                        🖼️
                      </button>
                      <button
                        onClick={() => rescrapeFolder(mangaChapters[0]?.mangaId)}
                        className="px-1 sm:px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 min-w-0 flex-shrink-0"
                        title="Re-scrape manga data"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => deleteMangaFolder(mangaTitle)}
                        className="px-1 sm:px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 min-w-0 flex-shrink-0"
                        title="Delete all chapters in this manga"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {expandedFolders.has(mangaTitle) && (
                    <div className="space-y-2 ml-4">
                    {mangaChapters.map((chapter: any) => (
                      <div key={chapter._id} className={`flex justify-between items-center p-2 rounded ${
                        selectedChapters.has(chapter._id) ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedChapters.has(chapter._id)}
                            onChange={() => toggleChapterSelection(chapter._id)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              📄 Chapter {chapter.number}: {chapter.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {chapter.folderPath || `${mangaTitle}/Chapter ${chapter.number}`} • {chapter.pages?.length || 0} pages • {new Date(chapter.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteChapter(chapter._id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}