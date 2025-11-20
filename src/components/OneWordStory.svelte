<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user, profile } from '../stores/authStore';
  import { supabase, getTodaysTheme, getThemeDisplayName } from '../utils/supabase';

  let story = '';
  let wordCount = 0;
  let storyId = '';
  let storyStatus: 'active' | 'wrap_up' | 'published' = 'active';
  let theme = '';
  let wordInput = '';
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let isLoading = true;
  let showAuthPrompt = false;
  let realtimeChannel: any;

  // Get today's theme
  $: themeDisplay = theme ? getThemeDisplayName(theme) : '';
  $: isWrapUp = storyStatus === 'wrap_up';
  $: maxWords = 900;

  onMount(async () => {
    await fetchStory();
    setupRealtimeSubscription();

    // Check if user is authenticated
    if (!$user) {
      showAuthPrompt = true;
    }
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  });

  function setupRealtimeSubscription() {
    // Subscribe to story changes
    realtimeChannel = supabase
      .channel('story-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('Story changed:', payload);
          fetchStory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contributions'
        },
        (payload) => {
          console.log('New contribution:', payload);
          // Refresh story when a new contribution is added
          fetchStory();
        }
      )
      .subscribe();
  }

  async function fetchStory() {
    isLoading = true;
    errorMessage = '';
    try {
      // Get current active story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .in('status', ['active', 'wrap_up'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (storyError && storyError.code !== 'PGRST116') {
        console.error('Error fetching story:', storyError);
        errorMessage = 'Failed to load story';
        isLoading = false;
        return;
      }

      if (!storyData) {
        // No active story, create one
        const todayTheme = getTodaysTheme();
        const { data: newStory, error: createError } = await supabase
          .from('stories')
          .insert({
            theme: todayTheme,
            status: 'active',
            word_count: 0,
            max_words: 900
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating story:', createError);
          errorMessage = 'Failed to create story';
          isLoading = false;
          return;
        }

        storyId = newStory.story_id;
        storyStatus = newStory.status;
        theme = newStory.theme || '';
        wordCount = newStory.word_count;
        story = '';
        isLoading = false;
        return;
      }

      // Fetch all contributions for this story
      const { data: contributions, error: contribError } = await supabase
        .from('contributions')
        .select('word, word_position')
        .eq('story_id', storyData.story_id)
        .order('word_position', { ascending: true });

      if (contribError) {
        console.error('Error fetching contributions:', contribError);
      }

      storyId = storyData.story_id;
      storyStatus = storyData.status;
      theme = storyData.theme || '';
      wordCount = storyData.word_count;
      maxWords = storyData.max_words || 900;

      // Reconstruct story from contributions
      if (contributions && contributions.length > 0) {
        story = contributions.map(c => c.word).join(' ');
      } else {
        story = '';
      }

    } catch (error) {
      errorMessage = 'Failed to load story. Please try again.';
      console.error('Error in fetchStory:', error);
    } finally {
      isLoading = false;
    }
  }

  async function submitWord() {
    if (!$user || !$profile) {
      errorMessage = 'Please sign in to contribute';
      showAuthPrompt = true;
      return;
    }

    if (!wordInput.trim()) {
      errorMessage = 'Please enter a word';
      return;
    }

    if (wordInput.trim().split(/\s+/).length > 1) {
      errorMessage = 'Please enter only one word';
      return;
    }

    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    try {
      // Call API endpoint for validation and submission
      const response = await fetch('/api/one-word-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: wordInput.trim(),
          userId: $user.id,
          storyId: storyId
        })
      });

      const data = await response.json();

      if (data.success) {
        wordInput = '';
        successMessage = 'Word added successfully!';

        if (data.storyCompleted) {
          successMessage = `🎉 Story completed! Starting a new story...`;
        } else if (data.wrapUpMode) {
          successMessage = `Word added! Story is in wrap-up mode (${wordCount + 1}/900 words).`;
        }

        // Story will auto-refresh via realtime subscription
        await fetchStory();

        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = '';
        }, 3000);
      } else {
        errorMessage = data.error || 'Failed to submit word';
      }
    } catch (error) {
      errorMessage = 'Failed to submit word. Please try again.';
      console.error('Error submitting word:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !isSubmitting) {
      submitWord();
    }
  }

  function getWordsRemaining() {
    return Math.max(0, maxWords - wordCount);
  }

  function getProgressPercentage() {
    return Math.min(100, (wordCount / maxWords) * 100);
  }
</script>

<div class="one-word-story">
  <div class="story-header">
    <h2>One Word Story</h2>
    {#if themeDisplay}
      <div class="theme-badge">{themeDisplay}</div>
    {/if}
    <p class="story-description">
      A collaborative story written one word at a time by the Siblings Write community.
      {#if isWrapUp}
        <strong>⚠️ Wrap-up mode! Story is almost complete.</strong>
      {:else}
        Contribute your word to help tell the tale!
      {/if}
    </p>
  </div>

  <div class="story-stats">
    <div class="stat">
      <span class="stat-value">{wordCount}</span>
      <span class="stat-label">Words</span>
    </div>
    <div class="stat">
      <span class="stat-value">{getWordsRemaining()}</span>
      <span class="stat-label">Until Complete</span>
    </div>
  </div>

  <div class="progress-bar">
    <div class="progress-fill" style="width: {getProgressPercentage()}%"></div>
  </div>

  <div class="story-container" class:wrap-up={isWrapUp}>
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading story...</p>
      </div>
    {:else if story}
      <div class="story-text">{story}</div>
    {:else}
      <div class="empty-story">Be the first to start the story!</div>
    {/if}
  </div>

  {#if !$user || !$profile}
    <div class="auth-prompt">
      <p>🔒 Sign in to contribute to the story</p>
      <p class="auth-prompt-hint">Once signed in, you can add words and track your streak!</p>
    </div>
  {:else}
    <div class="word-input-container">
      <input
        type="text"
        bind:value={wordInput}
        on:keypress={handleKeyPress}
        placeholder="Enter one word..."
        disabled={isSubmitting}
        maxlength="30"
        class="word-input"
      />
      <button
        on:click={submitWord}
        disabled={isSubmitting || !wordInput.trim()}
        class="submit-button"
      >
        {isSubmitting ? 'Submitting...' : 'Add Word'}
      </button>
    </div>

    {#if $profile}
      <div class="user-info">
        Contributing as <strong>{$profile.username}</strong>
        • {$profile.total_words} word{$profile.total_words !== 1 ? 's' : ''} contributed
        {#if $profile.current_streak > 0}
          • 🔥 {$profile.current_streak} day streak
        {/if}
      </div>
    {/if}
  {/if}

  {#if errorMessage}
    <div class="message error-message">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="message success-message">{successMessage}</div>
  {/if}

  <div class="story-rules">
    <h3>Rules</h3>
    <ul>
      <li>Submit one word at a time</li>
      <li>You cannot submit two consecutive words</li>
      <li>Words must be in English</li>
      <li>No inappropriate language</li>
      <li>At 850 words, the story enters "wrap-up mode"</li>
      <li>When the story reaches 900 words, it will be published and a new story begins!</li>
    </ul>
  </div>
</div>

<style>
  .one-word-story {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .story-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .story-header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-main);
  }

  .theme-badge {
    display: inline-block;
    padding: 6px 16px;
    background: linear-gradient(135deg, var(--primary-color), #7b2cbf);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .story-description {
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .story-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: rgba(128, 128, 128, 0.2);
    border-radius: 4px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color), #7b2cbf);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .story-container {
    background-color: rgba(128, 128, 128, 0.05);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    min-height: 200px;
    border: 2px solid rgba(128, 128, 128, 0.2);
    transition: border-color 0.3s;
  }

  .story-container.wrap-up {
    border-color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.05);
  }

  .story-text {
    font-size: 1.2rem;
    line-height: 1.8;
    color: var(--text-main);
    text-align: justify;
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

  .loading p,
  .empty-story {
    color: var(--text-secondary);
    font-style: italic;
  }

  .auth-prompt {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(123, 44, 191, 0.1));
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-prompt p {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .auth-prompt-hint {
    font-size: 0.9rem !important;
    font-weight: 400 !important;
    color: var(--text-secondary) !important;
  }

  .word-input-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .word-input {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 8px;
    background-color: var(--background-body);
    color: var(--text-main);
    transition: border-color 0.2s;
  }

  .word-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .word-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background-color: var(--primary-color);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
  }

  .submit-button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .user-info {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(128, 128, 128, 0.05);
    border-radius: 8px;
  }

  .message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 500;
    text-align: center;
  }

  .error-message {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .success-message {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .story-rules {
    background-color: rgba(128, 128, 128, 0.05);
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    border: 1px solid rgba(128, 128, 128, 0.2);
  }

  .story-rules h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-main);
  }

  .story-rules ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .story-rules li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }

  @media (max-width: 600px) {
    .story-header h2 {
      font-size: 2rem;
    }

    .story-stats {
      gap: 2rem;
    }

    .word-input-container {
      flex-direction: column;
    }

    .submit-button {
      width: 100%;
    }
  }
</style>
