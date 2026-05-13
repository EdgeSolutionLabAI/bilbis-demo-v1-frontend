'use client';

import { useActivePresence } from '../hooks/use-active-presence';

export function PresenceBadge() {
  const { activeCount, isLoading } = useActivePresence();

  if (isLoading) {
    return <div className="h-6 w-36 animate-pulse rounded-full bg-gray-200" />;
  }

  if (activeCount === 0) return null;

  const label = activeCount === 1 ? '1 person viewing' : `${activeCount} people viewing`;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm shadow-sm ring-1 ring-gray-200">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      <span>{label}</span>
    </div>
  );
}
