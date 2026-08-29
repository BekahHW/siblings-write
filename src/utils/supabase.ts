import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_words: number;
  total_stories: number;
  current_streak: number;
  longest_streak: number;
  last_contribution_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: number;
  story_id: string;
  title: string | null;
  theme: string | null;
  status: 'active' | 'wrap_up' | 'published';
  word_count: number;
  max_words: number;
  last_contributor_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  votes: number;
  is_story_of_week: boolean;
  is_monthly_winner: boolean;
}

export interface Contribution {
  id: number;
  story_id: string;
  user_id: string;
  word: string;
  word_position: number;
  created_at: string;
}

export interface Badge {
  id: number;
  user_id: string;
  badge_type: string;
  story_id: string | null;
  earned_at: string;
}

export interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  story_id: string | null;
  badge_id: number | null;
  is_read: boolean;
  created_at: string;
}

// Auth helper functions
export async function signUp(email: string, password: string, username: string) {
  // Check if username is available
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { data: null, error: { message: 'Username already taken' } };
  }

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) return { data: null, error };

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        email,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return { data: null, error: profileError };
    }
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// Get today's theme based on day of week
export function getTodaysTheme(): string {
  const dayOfWeek = new Date().getDay();
  const themes = {
    0: 'slice_of_life', // Sunday
    1: 'mystery',       // Monday
    2: 'time_travel',   // Tuesday
    3: 'whimsical',     // Wednesday
    4: 'thriller',      // Thursday
    5: 'fantasy',       // Friday
    6: 'sci_fi',        // Saturday
  };
  return themes[dayOfWeek as keyof typeof themes];
}

// Get theme display name
export function getThemeDisplayName(theme: string): string {
  const names: Record<string, string> = {
    mystery: 'Mystery Monday',
    time_travel: 'Time-Travel Tuesday',
    whimsical: 'Whimsical Wednesday',
    thriller: 'Thriller Thursday',
    fantasy: 'Fantasy Friday',
    sci_fi: 'Sci-Fi Saturday',
    slice_of_life: 'Slice-of-Life Sunday',
  };
  return names[theme] || theme;
}
