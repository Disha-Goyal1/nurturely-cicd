import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentSession,
  getSupabaseClient,
  loginAccount,
  logoutAccount,
  publicProfile,
  registerAccount,
  updateAccountProfile,
} from './supabaseAuth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    let subscription;

    try {
      const client = getSupabaseClient();
      ({ data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        authEventReceived = true;
        if (active) {
          setUser(publicProfile(session?.user));
          setAuthError('');
          setLoading(false);
        }
      }));
      getCurrentSession()
        .then((session) => {
          if (active && !authEventReceived) setUser(publicProfile(session?.user));
        })
        .catch((error) => {
          if (active) setAuthError(error.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } catch (error) {
      setAuthError(error.message);
      setLoading(false);
    }

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function register(details) {
    const result = await registerAccount(details);
    setAuthError('');
    if (result.authenticated) setUser(result.user);
    return result;
  }

  async function login(credentials) {
    const account = await loginAccount(credentials);
    setAuthError('');
    setUser(account);
    return account;
  }

  async function updateProfile(profile) {
    const updatedUser = await updateAccountProfile(profile);
    setUser(updatedUser);
    return updatedUser;
  }

  async function logout() {
    try {
      await logoutAccount();
      setAuthError('');
      setUser(null);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    login,
    register,
    updateProfile,
    logout,
  }), [user, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
