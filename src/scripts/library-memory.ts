export const VISITED_WORKS_KEY = 'siblings-write:visited-works';
export const SECRET_DISCOVERY_KEY = 'siblings-write:library-secret';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readVisitedWorks(storage: StorageLike | undefined = browserStorage()): string[] {
  if (!storage) return [];

  try {
    const value: unknown = JSON.parse(storage.getItem(VISITED_WORKS_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))];
  } catch {
    return [];
  }
}

export function markWorkVisited(
  workId: string,
  storage: StorageLike | undefined = browserStorage(),
): boolean {
  if (!storage || !workId) return false;

  try {
    const visited = readVisitedWorks(storage);
    if (!visited.includes(workId)) {
      storage.setItem(VISITED_WORKS_KEY, JSON.stringify([...visited, workId]));
    }
    return true;
  } catch {
    return false;
  }
}

export function hasDiscoveredLibrarySecret(
  storage: StorageLike | undefined = browserStorage(),
): boolean {
  if (!storage) return false;

  try {
    return storage.getItem(SECRET_DISCOVERY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function rememberLibrarySecret(
  storage: StorageLike | undefined = browserStorage(),
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(SECRET_DISCOVERY_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}
