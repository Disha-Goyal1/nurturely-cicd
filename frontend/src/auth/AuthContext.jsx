import { createContext, useContext, useMemo, useState } from 'react';
import {
  getAccount,
  getActiveAccountId,
  getAccounts,
  hashPassword,
  makeId,
  saveAccounts,
  setActiveAccountId,
  updateAccount,
} from '../data/localStore.js';

const AuthContext = createContext(null);

function publicProfile(account) {
  if (!account) return null;
  const { id, name, email, role } = account;
  return { id, name, email, role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => publicProfile(getAccount(getActiveAccountId())));

  async function register({ name, email, password, role }) {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists in this browser. Please sign in.');
    }
    const salt = makeId();
    const account = {
      id: makeId(),
      name: name.trim(),
      email: normalizedEmail,
      role,
      salt,
      passwordHash: await hashPassword(password, salt),
    };
    saveAccounts([...accounts, account]);
    setActiveAccountId(account.id);
    setUser(publicProfile(account));
    return publicProfile(account);
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const account = getAccounts().find((entry) => entry.email === normalizedEmail);
    if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
      throw new Error('We couldn’t find a matching local account. Create an account in this browser first.');
    }
    setActiveAccountId(account.id);
    setUser(publicProfile(account));
    return publicProfile(account);
  }

  function updateProfile(profile) {
    const updatedUser = { ...user, ...profile };
    updateAccount(updatedUser);
    setUser(updatedUser);
  }

  const value = useMemo(() => ({
    user,
    loading: false,
    login,
    register,
    updateProfile,
    logout: () => {
      setActiveAccountId(null);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
