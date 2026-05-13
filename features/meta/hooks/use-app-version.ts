'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STALE_TIME_MS = 60 * 60 * 1000; // 1 hour

export interface AppVersion {
  version: string;
  commit: string;
  buildTime: string;
}

interface UseAppVersionResult {
  data: AppVersion | null;
  isLoading: boolean;
}

// Module-level cache so re-mounts within the stale window skip the network.
let cachedData: AppVersion | null = null;
let cachedAt = 0;

export function useAppVersion(): UseAppVersionResult {
  const isFresh = cachedData !== null && Date.now() - cachedAt < STALE_TIME_MS;
  const [data, setData] = useState<AppVersion | null>(isFresh ? cachedData : null);
  const [isLoading, setIsLoading] = useState(!isFresh);

  useEffect(() => {
    if (cachedData !== null && Date.now() - cachedAt < STALE_TIME_MS) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${BACKEND_URL}/api/v1/meta/version`)
      .then((res) => res.json())
      .then((json: AppVersion) => {
        if (!cancelled) {
          cachedData = json;
          cachedAt = Date.now();
          setData(json);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading };
}
