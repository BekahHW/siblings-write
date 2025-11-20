import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';

export const prerender = false;

/**
 * POST /api/vote
 * Cast a vote for a story
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, storyId } = body;

    if (!userId || !storyId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID and Story ID are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('story_votes')
      .select('id')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single();

    if (existingVote) {
      return new Response(JSON.stringify({
        success: false,
        error: 'You have already voted for this story'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add vote
    const { error: voteError } = await supabase
      .from('story_votes')
      .insert({
        user_id: userId,
        story_id: storyId
      });

    if (voteError) {
      console.error('Error adding vote:', voteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to add vote'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update story vote count
    const { error: updateError } = await supabase.rpc('increment_story_votes', {
      story_uuid: storyId
    });

    if (updateError) {
      console.error('Error updating vote count:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Vote added successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/vote:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to add vote'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/vote
 * Remove a vote for a story
 */
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, storyId } = body;

    if (!userId || !storyId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID and Story ID are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove vote
    const { error: deleteError } = await supabase
      .from('story_votes')
      .delete()
      .eq('user_id', userId)
      .eq('story_id', storyId);

    if (deleteError) {
      console.error('Error removing vote:', deleteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to remove vote'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update story vote count
    const { error: updateError } = await supabase.rpc('decrement_story_votes', {
      story_uuid: storyId
    });

    if (updateError) {
      console.error('Error updating vote count:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Vote removed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in DELETE /api/vote:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to remove vote'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
