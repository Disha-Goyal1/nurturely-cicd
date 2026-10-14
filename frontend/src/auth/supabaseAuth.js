import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) {
    throw new Error('Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild the frontend.');
  }

  supabaseClient = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseClient;
}

export function publicProfile(user) {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  const allowedRoles = ['parent', 'caregiver', 'therapist'];
  const role = allowedRoles.includes(metadata.role) ? metadata.role : 'parent';
  return {
    id: user.id,
    name: metadata.full_name || user.email?.split('@')[0] || 'Nurturely member',
    email: user.email ?? '',
    role,
  };
}

function throwIfError(error) {
  if (error) throw new Error(error.message);
}

export async function getCurrentSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();
  throwIfError(error);
  return data.session;
}

export async function registerAccount({ name, email, password, role }) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        role,
      },
      emailRedirectTo: new URL('/login', window.location.origin).toString(),
    },
  });
  throwIfError(error);
  return {
    user: publicProfile(data.session?.user),
    authenticated: Boolean(data.session),
  };
}

export async function loginAccount({ email, password }) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  throwIfError(error);
  return publicProfile(data.user);
}

export async function logoutAccount() {
  const { error } = await getSupabaseClient().auth.signOut();
  throwIfError(error);
}

export async function updateAccountProfile({ name, email }) {
  const { data, error } = await getSupabaseClient().auth.updateUser({
    email: email.trim().toLowerCase(),
    data: { full_name: name.trim() },
  });
  throwIfError(error);
  return publicProfile(data.user);
}
