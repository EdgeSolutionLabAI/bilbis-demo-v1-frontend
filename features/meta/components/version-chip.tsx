'use client';

import { useAppVersion } from '../hooks/use-app-version';

export function VersionChip() {
  const { data, isLoading } = useAppVersion();

  if (isLoading || data === null) return null;

  const label = `v${data.version} · ${data.commit.slice(0, 7)}`;
  const tooltip = new Date(data.buildTime).toLocaleString();

  return (
    <span
      className="font-mono text-xs text-muted-foreground"
      title={tooltip}
    >
      {label}
    </span>
  );
}
