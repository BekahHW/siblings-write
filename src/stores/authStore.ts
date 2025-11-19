import { writable, derived } from 'svelte/store';
import { supabase, getCurrentUser, getProfile, type Profile } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

// Auth state stores
export const user = writable<User | null>(null);
export const profile = writable<Profile | null>(null);
export const loading = writable(true);

// Derived store for auth status
export const isAuthenticated = derived(user, ($user) => $user !== null);

// Initialize auth state
export async function initAuth() {
  loading.set(true);

  try {
    const { user: currentUser } = await getCurrentUser();

    if (currentUser) {
      user.set(currentUser);

      // Fetch profile
      const { data: profileData } = await getProfile(currentUser.id);
      if (profileData) {
        profile.set(profileData);
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    loading.set(false);
  }
}

// Listen to auth changes
export function setupAuthListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      user.set(session.user);

      // Fetch or create profile
      const { data: profileData } = await getProfile(session.user.id);
      if (profileData) {
        profile.set(profileData);
      }
    } else {
      user.set(null);
      profile.set(null);
    }

    loading.set(false);
  });

  return subscription;
}

// Clear auth state
export function clearAuth() {
  user.set(null);
  profile.set(null);
}
