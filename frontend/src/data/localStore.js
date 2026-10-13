const ACCOUNTS_KEY = 'nurturely_local_accounts';
const ACTIVE_ACCOUNT_KEY = 'nurturely_local_account';

function readJson(key, fallback) {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Nurturely could not read saved browser data. Clear this site’s storage and try again.');
  }
}

export function getAccounts() {
  return readJson(ACCOUNTS_KEY, []);
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveAccountId() {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
}

export function setActiveAccountId(id) {
  if (id) localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  else localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
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

export async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure local sign-in requires a modern browser on localhost or HTTPS.');
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: encoder.encode(salt),
    iterations: 120000,
  }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getAccount(accountId) {
  return getAccounts().find((account) => account.id === accountId) ?? null;
}

export function updateAccount(account) {
  saveAccounts(getAccounts().map((entry) => (
    entry.id === account.id ? { ...entry, ...account } : entry
  )));
}
