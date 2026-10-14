function readJson(key, fallback) {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Nurturely could not read saved browser data. Clear this site’s storage and try again.');
  }
}

export function readList(accountId, collection) {
  return readJson(`nurturely:${accountId}:${collection}`, []);
}

export function writeList(accountId, collection, items) {
  localStorage.setItem(`nurturely:${accountId}:${collection}`, JSON.stringify(items));
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
