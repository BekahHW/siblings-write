<script lang="ts">
  import { user, profile } from '../stores/authStore';
  import { signOut } from '../utils/supabase';

  let dropdownOpen = false;

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  async function handleSignOut() {
    await signOut();
    closeDropdown();
    window.location.href = '/';
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      closeDropdown();
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if $profile}
  <div class="user-menu">
    <button class="user-button" on:click|stopPropagation={toggleDropdown}>
      {#if $profile.avatar_url}
        <img src={$profile.avatar_url} alt={$profile.username} class="avatar" />
      {:else}
        <div class="avatar-placeholder">
          {$profile.username.charAt(0).toUpperCase()}
        </div>
      {/if}
      <span class="username">{$profile.username}</span>
      <svg class="dropdown-arrow" class:open={dropdownOpen} width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    {#if dropdownOpen}
      <div class="dropdown-menu">
        <div class="dropdown-header">
          <div class="stats">
            <div class="stat">
              <span class="stat-value">{$profile.total_words}</span>
              <span class="stat-label">words</span>
            </div>
            <div class="stat">
              <span class="stat-value">{$profile.current_streak}</span>
              <span class="stat-label">streak</span>
            </div>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <a href="/profile" class="dropdown-item" on:click={closeDropdown}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </a>

        <a href="/notifications" class="dropdown-item" on:click={closeDropdown}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </a>

        <a href="/leaderboard" class="dropdown-item" on:click={closeDropdown}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          Leaderboard
        </a>

        <div class="dropdown-divider"></div>

        <button class="dropdown-item" on:click={handleSignOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .user-menu {
    position: relative;
  }

  .user-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: transparent;
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-main);
    font-family: var(--font-family-sans);
    font-weight: 600;
  }

  .user-button:hover {
    border-color: var(--primary-color);
    background: rgba(128, 128, 128, 0.05);
  }

  .avatar,
  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
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
    font-size: 14px;
  }

  .username {
    font-size: 14px;
  }

  .dropdown-arrow {
    transition: transform 0.2s;
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--background-body);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    min-width: 220px;
    z-index: 100;
    overflow: hidden;
  }

  .dropdown-header {
    padding: 16px;
  }

  .stats {
    display: flex;
    gap: 24px;
    justify-content: center;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dropdown-divider {
    height: 1px;
    background: rgba(128, 128, 128, 0.2);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: var(--text-main);
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    font-family: var(--font-family-sans);
    transition: background 0.2s;
  }

  .dropdown-item:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  .dropdown-item svg {
    flex-shrink: 0;
    opacity: 0.7;
  }

  @media (max-width: 520px) {
    .username {
      display: none;
    }

    .user-button {
      padding: 6px;
      border-radius: 50%;
    }
  }
</style>
