function readJson(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : JSON.parse(value);
}

export function readList(accountId, collection) {
  return readJson(`nurturely:${accountId}:${collection}`, []);
}

export function writeList(accountId, collection, items) {
  localStorage.setItem(`nurturely:${accountId}:${collection}`, JSON.stringify(items));
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
