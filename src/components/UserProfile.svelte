<script lang="ts">
  import { onMount } from 'svelte';
  import { user, profile } from '../stores/authStore';
  import { supabase } from '../utils/supabase';

  interface Badge {
    id: number;
    badge_type: string;
    earned_at: string;
    story_id: string | null;
  }

  interface Upgrade {
    id: number;
    upgrade_type: string;
    purchased_at: string;
    amount_paid: number;
  }

  let badges: Badge[] = [];
  let upgrades: Upgrade[] = [];
  let loading = true;
  let editMode = false;
  let bio = '';
  let avatarUrl = '';

  $: if ($profile) {
    bio = $profile.bio || '';
    avatarUrl = $profile.avatar_url || '';
  }

  onMount(async () => {
    if ($user) {
      await fetchUserData();
    }
    loading = false;
  });

  async function fetchUserData() {
    if (!$user) return;

    // Fetch badges
    const { data: badgesData } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', $user.id)
      .order('earned_at', { ascending: false });

    if (badgesData) {
      badges = badgesData;
    }

    // Fetch upgrades
    const { data: upgradesData } = await supabase
      .from('user_upgrades')
      .select('*')
      .eq('user_id', $user.id)
      .order('purchased_at', { ascending: false });

    if (upgradesData) {
      upgrades = upgradesData;
    }
  }

  async function saveProfile() {
    if (!$user || !$profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        bio,
        avatar_url: avatarUrl || null
      })
      .eq('id', $user.id);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } else {
      editMode = false;
      // Refresh profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', $user.id)
        .single();

      if (data) {
        profile.set(data);
      }
    }
  }

  function getBadgeIcon(type: string): string {
    const icons: Record<string, string> = {
      first_word: '🎯',
      hundred_words: '💯',
      five_hundred_words: '🌟',
      thousand_words: '🏆',
      week_streak: '🔥',
      month_streak: '💪',
      story_complete: '📖',
      top_contributor: '👑',
    };
    return icons[type] || '🎖️';
  }

  function getBadgeName(type: string): string {
    const names: Record<string, string> = {
      first_word: 'First Word',
      hundred_words: '100 Words',
      five_hundred_words: '500 Words',
      thousand_words: '1000 Words',
      week_streak: '7 Day Streak',
      month_streak: '30 Day Streak',
      story_complete: 'Story Completed',
      top_contributor: 'Top Contributor',
    };
    return names[type] || type.replace('_', ' ');
  }

  function getUpgradeName(type: string): string {
    const names: Record<string, string> = {
      multi_word: 'Multi-Word Submission',
      story_extension: 'Story Extension +100',
      word_edit: 'Word Edit Access',
      membership: 'Premium Membership',
    };
    return names[type] || type;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
</script>

{#if !$user || !$profile}
  <div class="auth-required">
    <h2>Sign in to view your profile</h2>
    <p>Create an account to track your contributions and earn badges!</p>
  </div>
{:else if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading profile...</p>
  </div>
{:else}
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-section">
        {#if avatarUrl && !editMode}
          <img src={avatarUrl} alt={$profile.username} class="avatar-large" />
        {:else if !editMode}
          <div class="avatar-placeholder-large">
            {$profile.username.charAt(0).toUpperCase()}
          </div>
        {/if}

        {#if editMode}
          <div class="edit-avatar">
            <label for="avatar-url">Avatar URL</label>
            <input
              id="avatar-url"
              type="url"
              bind:value={avatarUrl}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        {/if}
      </div>

      <div class="profile-info">
        <h1>{$profile.username}</h1>
        
        {#if editMode}
          <div class="edit-bio">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              bind:value={bio}
              placeholder="Tell us about yourself..."
              maxlength="200"
            ></textarea>
            <div class="edit-actions">
              <button class="btn-save" on:click={saveProfile}>Save</button>
              <button class="btn-cancel" on:click={() => { editMode = false; bio = $profile.bio || ''; avatarUrl = $profile.avatar_url || ''; }}>
                Cancel
              </button>
            </div>
          </div>
        {:else}
          {#if bio}
            <p class="bio">{bio}</p>
          {/if}
          <button class="btn-edit" on:click={() => editMode = true}>
            ✏️ Edit Profile
          </button>
        {/if}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">✍️</div>
        <div class="stat-value">{$profile.total_words.toLocaleString()}</div>
        <div class="stat-label">Total Words</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">{$profile.total_stories.toLocaleString()}</div>
        <div class="stat-label">Stories</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">{$profile.current_streak}</div>
        <div class="stat-label">Current Streak</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏅</div>
        <div class="stat-value">{$profile.longest_streak}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
    </div>

    <div class="badges-section">
      <h2>🏆 Badges ({badges.length})</h2>
      {#if badges.length === 0}
        <p class="empty-state">No badges earned yet. Keep contributing to earn badges!</p>
      {:else}
        <div class="badges-grid">
          {#each badges as badge}
            <div class="badge-card">
              <div class="badge-icon">{getBadgeIcon(badge.badge_type)}</div>
              <div class="badge-name">{getBadgeName(badge.badge_type)}</div>
              <div class="badge-date">{formatDate(badge.earned_at)}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="upgrades-section">
      <h2>💎 Upgrades ({upgrades.length})</h2>
      {#if upgrades.length === 0}
        <p class="empty-state">No upgrades purchased yet.</p>
      {:else}
        <div class="upgrades-list">
          {#each upgrades as upgrade}
            <div class="upgrade-card">
              <div class="upgrade-info">
                <div class="upgrade-name">{getUpgradeName(upgrade.upgrade_type)}</div>
                <div class="upgrade-date">{formatDate(upgrade.purchased_at)}</div>
              </div>
              <div class="upgrade-price">{formatPrice(upgrade.amount_paid)}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .auth-required {
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(128, 128, 128, 0.05);
    border-radius: 12px;
  }

  .auth-required h2 {
    margin-bottom: 1rem;
    color: var(--text-main);
  }

  .auth-required p {
    color: var(--text-secondary);
  }

  .loading {
    text-align: center;
    padding: 4rem 0;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(128, 128, 128, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .profile-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .profile-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 2rem;
    background: rgba(128, 128, 128, 0.05);
    border-radius: 12px;
  }

  .avatar-section {
    flex-shrink: 0;
  }

  .avatar-large,
  .avatar-placeholder-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }

  .avatar-large {
    object-fit: cover;
  }

  .avatar-placeholder-large {
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 3rem;
  }

  .edit-avatar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-avatar label {
    font-weight: 600;
    color: var(--text-main);
  }

  .edit-avatar input {
    padding: 0.5rem;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 8px;
    background: var(--background-body);
    color: var(--text-main);
  }

  .profile-info {
    flex: 1;
  }

  .profile-info h1 {
    margin: 0 0 1rem 0;
    color: var(--text-main);
  }

  .bio {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .edit-bio {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-bio label {
    font-weight: 600;
    color: var(--text-main);
  }

  .edit-bio textarea {
    padding: 0.75rem;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 8px;
    background: var(--background-body);
    color: var(--text-main);
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
  }

  .edit-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .btn-save,
  .btn-cancel,
  .btn-edit {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-save {
    background: var(--primary-color);
    color: white;
  }

  .btn-cancel {
    background: rgba(128, 128, 128, 0.2);
    color: var(--text-main);
  }

  .btn-edit {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }

  .btn-save:hover,
  .btn-cancel:hover,
  .btn-edit:hover {
    opacity: 0.8;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    padding: 1.5rem;
    background: rgba(128, 128, 128, 0.05);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
    text-align: center;
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badges-section,
  .upgrades-section {
    margin-bottom: 3rem;
  }

  .badges-section h2,
  .upgrades-section h2 {
    margin-bottom: 1.5rem;
    color: var(--text-main);
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .badge-card {
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.05));
    border: 2px solid rgba(255, 193, 7, 0.3);
    border-radius: 12px;
    text-align: center;
  }

  .badge-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .badge-name {
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .badge-date {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .upgrades-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .upgrade-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(128, 128, 128, 0.05);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
  }

  .upgrade-name {
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .upgrade-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .upgrade-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  @media (max-width: 600px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
    }

    .avatar-section {
      margin: 0 auto;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .badges-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
