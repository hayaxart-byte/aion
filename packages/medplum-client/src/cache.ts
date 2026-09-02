interface CacheEntry<T> {
  data: T;
  expiry: number;
}

interface PendingEntry<T> {
  promise: Promise<T>;
  expiry: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, PendingEntry<unknown>>();

const DEFAULT_TTL = 30_000;

function isExpired(entry: { expiry: number }): boolean {
  return Date.now() > entry.expiry;
}

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (isExpired(entry)) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  store.set(key, { data, expiry: Date.now() + ttl });
}

export function invalidate(key: string): void {
  store.delete(key);
  pending.delete(key);
}

export function invalidateAll(): void {
  store.clear();
  pending.clear();
}

export function getPending<T>(key: string): Promise<T> | undefined {
  const entry = pending.get(key);
  if (!entry) return undefined;
  if (isExpired(entry)) {
    pending.delete(key);
    return undefined;
  }
  return entry.promise as Promise<T>;
}

export function setPending<T>(key: string, promise: Promise<T>, ttl: number = DEFAULT_TTL): void {
  pending.set(key, { promise, expiry: Date.now() + ttl });
  promise.finally(() => {
    if (pending.get(key)?.promise === promise) {
      pending.delete(key);
    }
  });
}
