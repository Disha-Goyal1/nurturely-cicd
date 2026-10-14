
const ACCOUNTS_KEY = 'nurturely:accounts';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readAccounts() {
  const accounts = readJson(ACCOUNTS_KEY, []);
  return Array.isArray(accounts) ? accounts : [];
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getAccounts() {
  return readAccounts();
}

export function saveAccount(account) {
  const accounts = readAccounts();
  const index = accounts.findIndex(
    item => item.id === account.id
  );

  if (index >= 0) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }

  saveAccounts(accounts);
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return Date.now() + '-' + Math.random().toString(36).slice(2);
}

export async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      'Secure password hashing requires HTTPS. Please open the secure version of Nurturely.'
    );
  }

  const encoder = new TextEncoder();

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: 120000
    },
    key,
    256
  );

  return Array.from(new Uint8Array(bits))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getAccount(accountId) {
  return readAccounts().find(
    account => account.id === accountId
  ) ?? null;
}

export function updateAccount(account) {
  const accounts = readAccounts().map(existing =>
    existing.id === account.id
      ? { ...existing, ...account }
      : existing
  );

  saveAccounts(accounts);
}

export function readList(accountId, collection) {
  return readJson(
    `nurturely:${accountId}:${collection}`,
    []
  );
}

export function writeList(accountId, collection, items) {
  const key = `nurturely:${accountId}:${collection}`;
  localStorage.setItem(key, JSON.stringify(items));
}
