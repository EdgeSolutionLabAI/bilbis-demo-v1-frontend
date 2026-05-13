const STORAGE_KEY = 'bilbis-demo-visitor-id';

export function getOrCreateVisitorId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
