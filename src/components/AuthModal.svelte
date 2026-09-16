<script lang="ts">
  import { signIn, signUp, signInWithGoogle, signInWithApple } from '../utils/supabase';
  import { initAuth } from '../stores/authStore';

  export let isOpen = false;
  export let onClose: () => void;

  let mode: 'signin' | 'signup' = 'signin';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let username = '';
  let error = '';
  let loading = false;
  let message = '';

  function resetForm() {
    email = '';
    password = '';
    confirmPassword = '';
    username = '';
    error = '';
    message = '';
  }

  function switchMode() {
    mode = mode === 'signin' ? 'signup' : 'signin';
    resetForm();
  }

  async function handleSubmit() {
    error = '';
    message = '';
    loading = true;

    try {
      if (mode === 'signup') {
        // Validate username
        if (!username || username.length < 3 || username.length > 20) {
          error = 'Username must be between 3 and 20 characters';
          loading = false;
          return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          error = 'Username can only contain letters, numbers, hyphens, and underscores';
          loading = false;
          return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
          error = 'Passwords do not match';
          loading = false;
          return;
        }

        if (password.length < 6) {
          error = 'Password must be at least 6 characters';
          loading = false;
          return;
        }

        const { error: signUpError } = await signUp(email, password, username);

        if (signUpError) {
          error = signUpError.message;
        } else {
          message = 'Check your email to confirm your account!';
          resetForm();
        }
      } else {
        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          error = signInError.message;
        } else {
          await initAuth();
          onClose();
        }
      }
    } catch (e: any) {
      error = e.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleGoogleSignIn() {
    loading = true;
    error = '';

    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        error = googleError.message;
      }
    } catch (e: any) {
      error = e.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleAppleSignIn() {
    loading = true;
    error = '';

    try {
      const { error: appleError } = await signInWithApple();
      if (appleError) {
        error = appleError.message;
      }
    } catch (e: any) {
      error = e.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-content">
      <button class="close-btn" on:click={onClose} aria-label="Close">×</button>

      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      {#if message}
        <div class="success-message">{message}</div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        {#if mode === 'signup'}
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              bind:value={username}
              placeholder="Choose a username"
              required
              minlength="3"
              maxlength="20"
              pattern="[a-zA-Z0-9_-]+"
              disabled={loading}
            />
            <small>3-20 characters, letters, numbers, hyphens, and underscores only</small>
          </div>
        {/if}

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
            minlength="6"
            disabled={loading}
          />
        </div>

        {#if mode === 'signup'}
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              bind:value={confirmPassword}
              placeholder="••••••••"
              required
              minlength="6"
              disabled={loading}
            />
          </div>
        {/if}

        <button type="submit" class="submit-btn" disabled={loading}>
          {#if loading}
            {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
          {:else}
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          {/if}
        </button>
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <div class="oauth-buttons">
        <button class="oauth-btn google" on:click={handleGoogleSignIn} disabled={loading}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button class="oauth-btn apple" on:click={handleAppleSignIn} disabled={loading}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>
      </div>

      <div class="mode-switch">
        {#if mode === 'signin'}
          <p>Don't have an account? <button on:click={switchMode}>Sign up</button></p>
        {:else}
          <p>Already have an account? <button on:click={switchMode}>Sign in</button></p>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: var(--background-body);
    border-radius: 12px;
    padding: 32px;
    max-width: 440px;
    width: 100%;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 32px;
    cursor: pointer;
    color: var(--text-main);
    opacity: 0.6;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .close-btn:hover {
    opacity: 1;
  }

  h2 {
    margin: 0 0 24px 0;
    font-size: 28px;
    color: var(--text-main);
    text-align: center;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-main);
  }

  input {
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 8px;
    font-size: 16px;
    background: var(--background-body);
    color: var(--text-main);
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .submit-btn {
    width: 100%;
    padding: 14px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 24px 0;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(128, 128, 128, 0.3);
  }

  .divider span {
    position: relative;
    background: var(--background-body);
    padding: 0 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .oauth-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .oauth-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 8px;
    background: var(--background-body);
    color: var(--text-main);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .oauth-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    background: rgba(128, 128, 128, 0.05);
  }

  .oauth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .oauth-btn svg {
    flex-shrink: 0;
  }

  .mode-switch {
    margin-top: 24px;
    text-align: center;
  }

  .mode-switch p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .mode-switch button {
    background: none;
    border: none;
    color: var(--primary-color);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .mode-switch button:hover {
    opacity: 0.8;
  }

  .error-message {
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .success-message {
    padding: 12px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    color: #22c55e;
    margin-bottom: 20px;
    font-size: 14px;
  }

  @media (max-width: 520px) {
    .modal-content {
      padding: 24px;
    }

    h2 {
      font-size: 24px;
    }
  }
</style>
