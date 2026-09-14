const VISITED_KEY = 'sw-library-visited-works';
const SECRET_KEY = 'sw-library-tree-secret-seen';

export function getVisitedWorkIds(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function markWorkVisited(workId: string): void {
  if (!workId || typeof localStorage === 'undefined') return;
  const ids = new Set(getVisitedWorkIds());
  ids.add(workId);
  localStorage.setItem(VISITED_KEY, JSON.stringify([...ids]));
}

export function hasVisitedAnyWork(): boolean {
  return getVisitedWorkIds().length > 0;
}

export function markTreeSecretSeen(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SECRET_KEY, '1');
}

export function hasSeenTreeSecret(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SECRET_KEY) === '1';
}
