import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';

export const prerender = false;

/**
 * GET /api/notifications?userId=xxx
 * Get user notifications
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch notifications'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const unreadCount = data?.filter(n => !n.is_read).length || 0;

    return new Response(JSON.stringify({
      success: true,
      notifications: data || [],
      unreadCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch notifications'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * PUT /api/notifications
 * Mark notifications as read
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { notificationIds, userId } = body;

    if (!notificationIds || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Notification IDs and User ID are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update notifications'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notifications marked as read'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PUT /api/notifications:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update notifications'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
