const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ClientCache {
  static get(key: string) {
    if (typeof window === 'undefined') return null;
    
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  }
  
  static set(key: string, data: any) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }
  
  static clear() {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('manga_')) {
        localStorage.removeItem(key);
      }
    });
  }
}