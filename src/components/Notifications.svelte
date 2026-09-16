<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user } from '../stores/authStore';
  import { supabase } from '../utils/supabase';

  interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    story_id: string | null;
    badge_id: number | null;
    is_read: boolean;
    created_at: string;
  }

  let notifications: Notification[] = [];
  let unreadCount = 0;
  let loading = true;
  let error = '';
  let realtimeChannel: any;

  onMount(async () => {
    if ($user) {
      await fetchNotifications();
      setupRealtimeSubscription();
    }
    loading = false;
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  });

  function setupRealtimeSubscription() {
    if (!$user) return;

    realtimeChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${$user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          notifications = [payload.new as Notification, ...notifications];
          if (!(payload.new as Notification).is_read) {
            unreadCount++;
          }
        }
      )
      .subscribe();
  }

  async function fetchNotifications() {
    if (!$user) return;

    loading = true;
    error = '';

    try {
      const response = await fetch(`/api/notifications?userId=${$user.id}`);
      const data = await response.json();

      if (data.success) {
        notifications = data.notifications;
        unreadCount = data.unreadCount;
      } else {
        error = data.error || 'Failed to fetch notifications';
      }
    } catch (e) {
      error = 'Failed to fetch notifications';
      console.error('Error fetching notifications:', e);
    } finally {
      loading = false;
    }
  }

  async function markAsRead(notificationIds: number[]) {
    if (!$user) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          userId: $user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        notifications = notifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        );
        unreadCount = notifications.filter(n => !n.is_read).length;
      }
    } catch (e) {
      console.error('Error marking notifications as read:', e);
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }

  function getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      badge_earned: '🏆',
      story_completed: '📖',
      story_of_week: '🌟',
      upgrade_purchased: '💎',
      vote_received: '👍',
      streak_milestone: '🔥',
    };
    return icons[type] || '📬';
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="notifications-container">
  <div class="notifications-header">
    <h1>🔔 Notifications</h1>
    {#if unreadCount > 0}
      <button class="mark-all-btn" on:click={markAllAsRead}>
        Mark all as read ({unreadCount})
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading notifications...</p>
    </div>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else if !$user}
    <div class="auth-required">
      <p>Sign in to view your notifications</p>
    </div>
  {:else if notifications.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No notifications yet</p>
      <p class="empty-hint">We'll notify you about badges, completed stories, and more!</p>
    </div>
  {:else}
    <div class="notifications-list">
      {#each notifications as notification}
        <div
          class="notification-card"
          class:unread={!notification.is_read}
          on:click={() => !notification.is_read && markAsRead([notification.id])}
        >
          <div class="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div class="notification-content">
            <div class="notification-title">{notification.title}</div>
            <div class="notification-message">{notification.message}</div>
            <div class="notification-time">{formatDate(notification.created_at)}</div>
          </div>
          {#if !notification.is_read}
            <div class="unread-dot"></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .notifications-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .notifications-header h1 {
    font-size: 2.5rem;
    margin: 0;
    color: var(--text-main);
  }

  .mark-all-btn {
    padding: 0.5rem 1rem;
    background: rgba(128, 128, 128, 0.2);
    border: none;
    border-radius: 8px;
    color: var(--text-main);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .mark-all-btn:hover {
    background: rgba(128, 128, 128, 0.3);
  }

  .loading {
    text-align: center;
    padding: 3rem 0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(128, 128, 128, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading p {
    color: var(--text-secondary);
  }

  .error-message {
    padding: 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    text-align: center;
  }

  .auth-required,
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .empty-hint {
    font-size: 0.9rem;
    font-style: italic;
  }

  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .notification-card {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(128, 128, 128, 0.05);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .notification-card:hover {
    border-color: var(--primary-color);
    transform: translateX(4px);
  }

  .notification-card.unread {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.05), rgba(123, 44, 191, 0.02));
    border-color: var(--primary-color);
  }

  .notification-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .notification-message {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 0.85rem;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  .unread-dot {
    width: 10px;
    height: 10px;
    background: var(--primary-color);
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.5rem;
  }

  @media (max-width: 600px) {
    .notifications-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .notifications-header h1 {
      font-size: 2rem;
    }

    .notification-card {
      padding: 1rem;
    }

    .notification-icon {
      font-size: 1.5rem;
    }
  }
</style>
