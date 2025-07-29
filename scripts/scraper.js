const mongoose = require('mongoose');
const { ScrapeService } = require('../src/lib/scrapeService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mangacap');

const scrapeService = new ScrapeService();

async function scrapePopularManga() {
  console.log('Starting manga scraping...');
  
  // Popular manga URLs to scrape
  const mangaUrls = [
    { url: 'https://mgeko.cc/manga/one-piece', site: 'mgeko' },
    { url: 'https://mgeko.cc/manga/naruto', site: 'mgeko' },
    { url: 'https://mgeko.cc/manga/attack-on-titan', site: 'mgeko' },
    // Add more URLs as needed
  ];
  
  for (const { url, site } of mangaUrls) {
    try {
      console.log(`Scraping ${url}...`);
      const mangaId = await scrapeService.scrapeManga(url, site);
      if (mangaId) {
        console.log(`Successfully scraped manga: ${mangaId}`);
      } else {
        console.log(`Failed to scrape: ${url}`);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  
  console.log('Scraping completed!');
  process.exit(0);
}

async function searchAndScrape(query) {
  console.log(`Searching for: ${query}`);
  
  try {
    const results = await scrapeService.searchAllSites(query);
    console.log(`Found ${results.length} results`);
    
    // Scrape first 5 results
    for (let i = 0; i < Math.min(5, results.length); i++) {
      const manga = results[i];
      console.log(`Scraping: ${manga.title}`);
      
      const mangaId = await scrapeService.scrapeManga(manga.url, manga.site);
      if (mangaId) {
        console.log(`Successfully scraped: ${manga.title}`);
      }
    }
  } catch (error) {
    console.error('Search and scrape error:', error);
  }
  
  process.exit(0);
}

// Command line arguments
const command = process.argv[2];
const query = process.argv[3];

if (command === 'popular') {
  scrapePopularManga();
} else if (command === 'search' && query) {
  searchAndScrape(query);
} else {
  console.log('Usage:');
  console.log('  node scripts/scraper.js popular');
  console.log('  node scripts/scraper.js search "manga name"');
  process.exit(1);
}