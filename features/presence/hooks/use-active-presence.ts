'use client';

import { useEffect, useState } from 'react';
import { getOrCreateVisitorId } from '../lib/visitor-id';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const POLL_INTERVAL_MS = 15_000;

export interface UseActivePresenceResult {
  activeCount: number;
  isLoading: boolean;
}

export function useActivePresence(): UseActivePresenceResult {
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fire heartbeat immediately and every 15s; skip when tab is hidden.
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    function sendHeartbeat() {
      if (document.visibilityState === 'hidden') return;
      fetch(`${BACKEND_URL}/api/v1/presence/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      }).catch(() => {});
    }

    sendHeartbeat();
    const id = setInterval(sendHeartbeat, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Poll active count every 15s; skip when tab is hidden.
  useEffect(() => {
    function fetchActive() {
      if (document.visibilityState === 'hidden') return;
      fetch(`${BACKEND_URL}/api/v1/presence/active`)
        .then((res) => res.json())
        .then((json: { activeCount: number }) => {
          setActiveCount(json.activeCount);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }

    fetchActive();
    const id = setInterval(fetchActive, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return { activeCount, isLoading };
}
