'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const POLL_INTERVAL_MS = 30_000;

interface UseApiStatusResult {
  isUp: boolean;
}

export function useApiStatus(): UseApiStatusResult {
  const [isUp, setIsUp] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ping`);
        const json = await res.json();
        if (!cancelled) setIsUp(json?.ok === true);
      } catch {
        if (!cancelled) setIsUp(false);
      }
    }

    ping();
    const id = setInterval(ping, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { isUp };
}
