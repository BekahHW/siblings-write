import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';

export const prerender = false;

/**
 * GET /api/leaderboard?type=words|streak|stories
 * Get leaderboard data
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'words';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let orderBy: string;
    switch (type) {
      case 'streak':
        orderBy = 'current_streak';
        break;
      case 'stories':
        orderBy = 'total_stories';
        break;
      case 'words':
      default:
        orderBy = 'total_words';
        break;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, total_words, total_stories, current_streak, longest_streak')
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch leaderboard'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      leaderboard: data || [],
      type
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch leaderboard'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
