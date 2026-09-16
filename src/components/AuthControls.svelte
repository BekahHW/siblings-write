<script lang="ts">
  import { onMount } from 'svelte';
  import { user, profile, loading, initAuth, setupAuthListener } from '../stores/authStore';
  import AuthModal from './AuthModal.svelte';
  import UserMenu from './UserMenu.svelte';

  let authModalOpen = false;
  let authSubscription: any;

  onMount(async () => {
    // Initialize auth state
    await initAuth();

    // Setup listener for auth changes
    authSubscription = setupAuthListener();

    // Cleanup
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  });

  function openAuthModal() {
    authModalOpen = true;
  }

  function closeAuthModal() {
    authModalOpen = false;
  }
</script>

{#if $loading}
  <div class="loading">
    <div class="spinner"></div>
  </div>
{:else if $user && $profile}
  <UserMenu />
{:else}
  <button class="sign-in-btn" on:click={openAuthModal}>
    Sign In
  </button>
{/if}

<AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(128, 128, 128, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .sign-in-btn {
    padding: 8px 20px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: var(--font-family-sans);
    text-transform: uppercase;
  }

  .sign-in-btn:hover {
    opacity: 0.9;
  }

  @media (max-width: 520px) {
    .sign-in-btn {
      padding: 6px 16px;
      font-size: 13px;
    }
  }
</style>
