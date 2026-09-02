'use client';

import { useEffect, useRef, useState } from 'react';
import { getCached, getPending, setCache, setPending } from './cache';

interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface Options {
  staleTime?: number;
  enabled?: boolean;
}

export function useMedplumQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Options = {}
): QueryResult<T> {
  const { staleTime = 30_000, enabled = true } = options;
  const [data, setData] = useState<T | undefined>(() => getCached<T>(key));
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      const cached = getCached<T>(key);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      const inflight = getPending<T>(key);
      if (inflight) {
        try {
          const result = await inflight;
          if (!cancelled) {
            setData(result);
            setIsLoading(false);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoading(false);
          }
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const promise = fetcherRef.current().then((result) => {
        setCache(key, result, staleTime);
        return result;
      });

      setPending(key, promise, staleTime);

      try {
        const result = await promise;
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [key, staleTime, enabled]);

  return { data, isLoading, error };
}
