import { useState, useEffect } from 'react';
import { ClientCache } from '@/lib/cache';

export function useCachedFetch<T>(url: string, cacheKey: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cached = ClientCache.get(cacheKey);
      if (cached) {
        setData(cached as T);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        setData(result as T);
        ClientCache.set(cacheKey, result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, cacheKey]);

  return { data, loading, error };
}