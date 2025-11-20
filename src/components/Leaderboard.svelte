<script lang="ts">
  import { onMount } from 'svelte';

  type LeaderType = 'words' | 'streak' | 'stories';

  interface LeaderEntry {
    id: string;
    username: string;
    avatar_url: string | null;
    total_words: number;
    total_stories: number;
    current_streak: number;
    longest_streak: number;
  }

  let leaderType: LeaderType = 'words';
  let leaderboard: LeaderEntry[] = [];
  let loading = true;
  let error = '';

  onMount(() => {
    fetchLeaderboard();
  });

  async function fetchLeaderboard() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`/api/leaderboard?type=${leaderType}&limit=20`);
      const data = await response.json();

      if (data.success) {
        leaderboard = data.leaderboard;
      } else {
        error = data.error || 'Failed to fetch leaderboard';
      }
    } catch (e) {
      error = 'Failed to fetch leaderboard';
      console.error('Error fetching leaderboard:', e);
    } finally {
      loading = false;
    }
  }

  function switchType(type: LeaderType) {
    leaderType = type;
    fetchLeaderboard();
  }

  function getStatValue(entry: LeaderEntry): number {
    switch (leaderType) {
      case 'streak':
        return entry.current_streak;
      case 'stories':
        return entry.total_stories;
      case 'words':
      default:
        return entry.total_words;
    }
  }

  function getStatLabel(): string {
    switch (leaderType) {
      case 'streak':
        return 'Day Streak';
      case 'stories':
        return 'Stories';
      case 'words':
      default:
        return 'Words';
    }
  }

  function getMedalEmoji(index: number): string {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  }
</script>

<div class="leaderboard-container">
  <div class="header">
    <h1>🏆 Leaderboard</h1>
    <p class="subtitle">Top contributors to our collaborative stories</p>
  </div>

  <div class="type-selector">
    <button
      class="type-btn"
      class:active={leaderType === 'words'}
      on:click={() => switchType('words')}
    >
      ✍️ Most Words
    </button>
    <button
      class="type-btn"
      class:active={leaderType === 'streak'}
      on:click={() => switchType('streak')}
    >
      🔥 Longest Streak
    </button>
    <button
      class="type-btn"
      class:active={leaderType === 'stories'}
      on:click={() => switchType('stories')}
    >
      📚 Most Stories
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading leaderboard...</p>
    </div>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else if leaderboard.length === 0}
    <div class="empty-state">
      <p>No contributors yet. Be the first to add a word!</p>
    </div>
  {:else}
    <div class="leaderboard-list">
      {#each leaderboard as entry, index}
        <div class="leader-entry" class:top-three={index < 3}>
          <div class="rank">
            {#if index < 3}
              <span class="medal">{getMedalEmoji(index)}</span>
            {:else}
              <span class="rank-number">#{index + 1}</span>
            {/if}
          </div>

          <div class="user-info">
            {#if entry.avatar_url}
              <img src={entry.avatar_url} alt={entry.username} class="avatar" />
            {:else}
              <div class="avatar-placeholder">
                {entry.username.charAt(0).toUpperCase()}
              </div>
            {/if}
            <span class="username">{entry.username}</span>
          </div>

          <div class="stats">
            <span class="stat-value">{getStatValue(entry).toLocaleString()}</span>
            <span class="stat-label">{getStatLabel()}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .leaderboard-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-main);
  }

  .subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  .type-selector {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .type-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 24px;
    background: transparent;
    color: var(--text-main);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-family-sans);
  }

  .type-btn:hover {
    border-color: var(--primary-color);
    background: rgba(128, 128, 128, 0.05);
  }

  .type-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
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
    to {
      transform: rotate(360deg);
    }
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

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .leader-entry {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(128, 128, 128, 0.05);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .leader-entry:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .leader-entry.top-three {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.05));
    border-color: rgba(255, 193, 7, 0.5);
  }

  .rank {
    min-width: 60px;
    text-align: center;
  }

  .medal {
    font-size: 2rem;
  }

  .rank-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .avatar,
  .avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .avatar {
    object-fit: cover;
  }

  .avatar-placeholder {
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .username {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 100px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 600px) {
    .header h1 {
      font-size: 2rem;
    }

    .type-selector {
      gap: 0.5rem;
    }

    .type-btn {
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    }

    .leader-entry {
      padding: 0.75rem 1rem;
    }

    .rank {
      min-width: 50px;
    }

    .medal {
      font-size: 1.5rem;
    }

    .rank-number {
      font-size: 1.2rem;
    }

    .avatar,
    .avatar-placeholder {
      width: 40px;
      height: 40px;
    }

    .username {
      font-size: 1rem;
    }

    .stat-value {
      font-size: 1.2rem;
    }
  }
</style>
