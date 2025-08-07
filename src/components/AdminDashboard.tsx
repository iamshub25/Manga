'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chapters, setChapters] = useState<any[]>([]);
  const [manga, setManga] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalManga: 0, totalChapters: 0, totalPages: 0 });
  const [groupedChapters, setGroupedChapters] = useState<{[key: string]: any[]}>({});
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');

  // Scraper state
  const [url, setUrl] = useState('');
  const [site, setSite] = useState('mgeko');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'chapters') {
      fetchChapters();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [chaptersRes, mangaRes] = await Promise.all([
        fetch('/api/admin/chapters'),
        fetch('/api/manga?limit=1000')
      ]);
      const chaptersData = await chaptersRes.json();
      const mangaData = await mangaRes.json();
      
      const totalPages = chaptersData.reduce((sum: number, ch: any) => sum + (ch.pages?.length || 0), 0);
      setStats({
        totalManga: mangaData.mangas?.length || 0,
        totalChapters: chaptersData.length,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/chapters');
      const data = await response.json();
      setChapters(data);
      
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

  const scrapeManga = async () => {
    if (!url) return;
    
    setLoading(true);
    setScrapeStatus('Starting scrape...');
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manga', url, site })
      });
      
      const data = await response.json();
      if (data.success) {
        setScrapeStatus('✅ Scrape completed successfully!');
        setUrl('');
        fetchStats();
      } else {
        setScrapeStatus('❌ Scrape failed');
      }
    } catch (error) {
      setScrapeStatus('❌ Error occurred during scraping');
    }
    setTimeout(() => setScrapeStatus(''), 5000);
    setLoading(false);
  };

  const searchManga = async () => {
    if (!query) return;
    
    setLoading(true);
    setScrapeStatus('🔍 Searching manga...');
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      });
      
      const data = await response.json();
      setResults(data.results || []);
      setScrapeStatus(`Found ${data.results?.length || 0} results`);
    } catch (error) {
      setScrapeStatus('❌ Search failed');
    }
    setTimeout(() => setScrapeStatus(''), 3000);
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
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <h1 className="text-xl font-bold">MangaCap Admin</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-2xl backdrop-blur-sm">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'scraper', label: '🔄 Scraper', icon: '🔄' },
            { id: 'chapters', label: '📚 Chapters', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Manga"
                value={stats.totalManga}
                icon="📖"
                color="from-blue-600 to-blue-700"
              />
              <StatCard
                title="Total Chapters"
                value={stats.totalChapters}
                icon="📄"
                color="from-green-600 to-green-700"
              />
              <StatCard
                title="Total Pages"
                value={stats.totalPages}
                icon="📑"
                color="from-purple-600 to-purple-700"
              />
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🎯 Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('scraper')}
                  className="p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl border border-blue-500/30 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-medium">Start Scraping</div>
                  <div className="text-sm text-gray-300">Add new manga</div>
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className="p-4 bg-green-600/20 hover:bg-green-600/30 rounded-xl border border-green-500/30 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium">Manage Chapters</div>
                  <div className="text-sm text-gray-300">Edit & organize</div>
                </button>
                <button
                  onClick={fetchStats}
                  className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl border border-purple-500/30 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-medium">Refresh Stats</div>
                  <div className="text-sm text-gray-300">Update dashboard</div>
                </button>
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="p-4 bg-orange-600/20 hover:bg-orange-600/30 rounded-xl border border-orange-500/30 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="font-medium">View Site</div>
                  <div className="text-sm text-gray-300">Open main site</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scraper Tab */}
        {activeTab === 'scraper' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🔄 Manga Scraper
              </h2>
              
              {/* Status Display */}
              {scrapeStatus && (
                <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-200">
                  {scrapeStatus}
                </div>
              )}

              {/* Direct Scraping */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🎯 Direct Scraping
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter manga URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mgeko" className='bg-black'>Mgeko</option>
                    <option value="mangadx" className='bg-black'>MangaDx</option>
                    <option value="mgekojumbo" className='bg-black'>Mgeko Jumbo</option>
                    <option value="thunderscans" className='bg-black'>ThunderScans</option>
                  </select>
                  <button
                    onClick={scrapeManga}
                    disabled={loading || !url}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Scraping...
                      </>
                    ) : (
                      <>🚀 Scrape</>
                    )}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔍 Search & Scrape
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Search manga titles..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={searchManga}
                    disabled={loading || !query}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Searching...
                      </>
                    ) : (
                      <>🔍 Search</>
                    )}
                  </button>
                </div>

                {results.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-green-600/20 border border-green-500/30 rounded-xl">
                      <span className="font-medium">Found {results.length} results</span>
                      <button
                        onClick={async () => {
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
                              if (response.ok) completed++;
                            } catch (error) {
                              console.error(`Failed to scrape ${manga.title}:`, error);
                            }
                          }
                          setScrapeStatus(`✅ Bulk scrape completed! ${completed}/${results.length} successful`);
                          setTimeout(() => setScrapeStatus(''), 5000);
                          setLoading(false);
                          fetchStats();
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Scraping All...
                          </>
                        ) : (
                          <>⚡ Scrape All</>
                        )}
                      </button>
                    </div>
                    {results.map((manga, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div>
                          <h4 className="font-medium text-white">{manga.title}</h4>
                          <p className="text-sm text-gray-400">{manga.author} • {manga.site}</p>
                        </div>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            setScrapeStatus(`Scraping ${manga.title}...`);
                            try {
                              const response = await fetch('/api/scrape', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'manga', url: manga.url, site: manga.site })
                              });
                              if (response.ok) {
                                setScrapeStatus(`✅ ${manga.title} scraped successfully!`);
                                fetchStats();
                              } else {
                                setScrapeStatus(`❌ Failed to scrape ${manga.title}`);
                              }
                            } catch (error) {
                              setScrapeStatus(`❌ Error scraping ${manga.title}`);
                            }
                            setTimeout(() => setScrapeStatus(''), 3000);
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                              Scraping...
                            </>
                          ) : (
                            <>🚀 Scrape</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📚 Chapters Management
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedFolders.size > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Rescrape ${selectedFolders.size} selected manga? This may take a while.`)) return;
                      setLoading(true);
                      let completed = 0;
                      for (const mangaTitle of selectedFolders) {
                        try {
                          setScrapeStatus(`Rescaping ${mangaTitle} (${completed + 1}/${selectedFolders.size})...`);
                          const mangaId = groupedChapters[mangaTitle]?.[0]?.mangaId;
                          const response = await fetch('/api/admin/manga', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mangaId })
                          });
                          if (response.ok) completed++;
                        } catch (error) {
                          console.error('Failed to rescrape folder:', error);
                        }
                      }
                      setScrapeStatus(`✅ Selected manga rescrape completed! ${completed}/${selectedFolders.size} successful`);
                      setTimeout(() => setScrapeStatus(''), 5000);
                      setSelectedFolders(new Set());
                      fetchChapters();
                      fetchStats();
                      setLoading(false);
                    }}
                    disabled={loading}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                        Rescaping...
                      </>
                    ) : (
                      <>🔄 Rescrape Selected ({selectedFolders.size})</>
                    )}
                  </button>
                )}
                <button
                  onClick={async () => {
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
                        if (response.ok) completed++;
                      } catch (error) {
                        console.error(`Failed to rescrape ${mangaTitle}:`, error);
                      }
                    }
                    setScrapeStatus(`✅ Bulk rescrape completed! ${completed}/${mangaList.length} successful`);
                    setTimeout(() => setScrapeStatus(''), 5000);
                    fetchChapters();
                    fetchStats();
                    setLoading(false);
                  }}
                  disabled={loading || Object.keys(groupedChapters).length === 0}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                      Rescaping...
                    </>
                  ) : (
                    <>⚡ Rescrape All</>
                  )}
                </button>
                <button
                  onClick={() => {
                    const allFolders = Object.keys(groupedChapters);
                    setSelectedFolders(selectedFolders.size === allFolders.length ? new Set() : new Set(allFolders));
                  }}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {selectedFolders.size === Object.keys(groupedChapters).length ? '❌ Deselect All' : '✅ Select All'}
                </button>
                <button
                  onClick={fetchChapters}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Search manga by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Status Display */}
            {scrapeStatus && (
              <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-200">
                {scrapeStatus}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading chapters...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedChapters)
                  .filter(([mangaTitle]) => 
                    mangaTitle.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(([mangaTitle, mangaChapters]) => (
                  <div key={mangaTitle} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedFolders.has(mangaTitle)}
                          onChange={() => {
                            setSelectedFolders(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(mangaTitle)) {
                                newSet.delete(mangaTitle);
                              } else {
                                newSet.add(mangaTitle);
                              }
                              return newSet;
                            });
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <h3 
                          className="font-bold text-lg text-blue-400 cursor-pointer hover:text-blue-300 flex items-center gap-2"
                          onClick={() => {
                            setExpandedFolders(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(mangaTitle)) {
                                newSet.delete(mangaTitle);
                              } else {
                                newSet.add(mangaTitle);
                              }
                              return newSet;
                            });
                          }}
                        >
                          {expandedFolders.has(mangaTitle) ? '📂' : '📁'} {mangaTitle}
                          <span className="text-sm text-gray-400">({mangaChapters.length} chapters)</span>
                        </h3>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Enter new manga title:', mangaTitle);
                            if (!newTitle || newTitle === mangaTitle) return;
                            fetch('/api/admin/manga', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ mangaId: mangaChapters[0]?.mangaId, title: newTitle })
                            }).then(response => {
                              if (response.ok) {
                                setScrapeStatus(`✅ Manga renamed to "${newTitle}"`);
                                setTimeout(() => setScrapeStatus(''), 3000);
                                fetchChapters();
                              }
                            });
                          }}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
                          title="Rename manga"
                        >
                          📝
                        </button>
                        <button
                          onClick={() => {
                            const choice = confirm('Upload from device? (OK = Upload file, Cancel = Enter URL)');
                            if (choice) {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('mangaId', mangaChapters[0]?.mangaId.toString());
                                try {
                                  const response = await fetch('/api/admin/upload', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    setScrapeStatus(`✅ Cover uploaded for "${mangaTitle}"`);
                                    setTimeout(() => setScrapeStatus(''), 3000);
                                    fetchChapters();
                                  } else {
                                    setScrapeStatus(`❌ Upload failed: ${data.error}`);
                                    setTimeout(() => setScrapeStatus(''), 3000);
                                  }
                                } catch (error) {
                                  setScrapeStatus('❌ Error uploading cover');
                                  setTimeout(() => setScrapeStatus(''), 3000);
                                }
                              };
                              input.click();
                            } else {
                              const coverUrl = prompt('Enter new cover image URL:');
                              if (!coverUrl) return;
                              fetch('/api/admin/manga', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mangaId: mangaChapters[0]?.mangaId, cover: coverUrl })
                              }).then(response => {
                                if (response.ok) {
                                  setScrapeStatus(`✅ Cover updated for "${mangaTitle}"`);
                                  setTimeout(() => setScrapeStatus(''), 3000);
                                }
                              });
                            }
                          }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                          title="Update cover image"
                        >
                          🖼️
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Re-scrape "${mangaTitle}"? This will update chapters and data.`)) return;
                            setLoading(true);
                            setScrapeStatus(`Re-scraping ${mangaTitle}...`);
                            try {
                              const response = await fetch('/api/admin/manga', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mangaId: mangaChapters[0]?.mangaId })
                              });
                              if (response.ok) {
                                setScrapeStatus(`✅ ${mangaTitle} re-scraped successfully!`);
                                fetchChapters();
                                fetchStats();
                              } else {
                                setScrapeStatus(`❌ Failed to re-scrape ${mangaTitle}`);
                              }
                            } catch (error) {
                              setScrapeStatus(`❌ Error re-scraping ${mangaTitle}`);
                            }
                            setTimeout(() => setScrapeStatus(''), 3000);
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                          title="Re-scrape manga"
                        >
                          🔄
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete "${mangaTitle}" manga and all ${mangaChapters.length} chapters?`)) return;
                            const chapterIds = mangaChapters.map(ch => ch._id);
                            const mangaId = mangaChapters[0]?.mangaId;
                            
                            try {
                              // Delete chapters first
                              await Promise.all(chapterIds.map(id => 
                                fetch('/api/admin/chapters', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ chapterId: id })
                                })
                              ));
                              
                              // Delete manga record
                              if (mangaId) {
                                await fetch('/api/admin/manga', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ mangaId })
                                });
                              }
                              
                              setScrapeStatus(`✅ "${mangaTitle}" deleted successfully`);
                              setTimeout(() => setScrapeStatus(''), 3000);
                              fetchChapters();
                              fetchStats();
                            } catch (error) {
                              setScrapeStatus(`❌ Error deleting "${mangaTitle}"`);
                              setTimeout(() => setScrapeStatus(''), 3000);
                            }
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                          title="Delete manga and all chapters"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {expandedFolders.has(mangaTitle) && (
                      <div className="space-y-2 ml-4">
                        {mangaChapters.map((chapter: any) => (
                          <div key={chapter._id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">
                                📄 Chapter {chapter.number}: {chapter.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {chapter.pages?.length || 0} pages • {new Date(chapter.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteChapter(chapter._id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {Object.entries(groupedChapters).filter(([mangaTitle]) => 
                  mangaTitle.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-400">No manga found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}