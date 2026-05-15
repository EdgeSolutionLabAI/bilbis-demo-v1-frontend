'use client';

import { useApiStatus } from '../hooks/use-api-status';

export function ApiStatusDot() {
  const { isUp } = useApiStatus();

  return (
    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
      API:
      <span
        aria-label={isUp ? 'API status: up' : 'API status: down'}
        role="img"
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isUp ? '#22c55e' : '#ef4444',
        }}
      />
    </span>
  );
}
