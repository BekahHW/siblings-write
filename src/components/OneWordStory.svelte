<script>
  import { onMount } from 'svelte';

  let story = '';
  let wordCount = 0;
  let storyId = '';
  let wordInput = '';
  let contributorId = '';
  let contributorName = '';
  let contributorUrl = '';
  let showContributorFields = false;
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let isLoading = true;

  // Generate or retrieve contributor ID and info
  onMount(() => {
    if (typeof localStorage !== 'undefined') {
      let id = localStorage.getItem('oneWordStoryContributorId');
      if (!id) {
        // Generate a simple unique ID
        id = `contributor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('oneWordStoryContributorId', id);
      }
      contributorId = id;

      // Load saved contributor info
      const savedName = localStorage.getItem('oneWordStoryContributorName');
      const savedUrl = localStorage.getItem('oneWordStoryContributorUrl');
      if (savedName) {
        contributorName = savedName;
        showContributorFields = true;
      }
      if (savedUrl) {
        contributorUrl = savedUrl;
        showContributorFields = true;
      }
    }
    fetchStory();
  });

  async function fetchStory() {
    isLoading = true;
    errorMessage = '';
    try {
      const response = await fetch('/api/one-word-story');
      const data = await response.json();

      if (data.success) {
        story = data.story.words || '';
        wordCount = data.story.wordCount || 0;
        storyId = data.story.storyId;
      } else {
        errorMessage = data.error || 'Failed to load story';
      }
    } catch (error) {
      errorMessage = 'Failed to load story. Please try again.';
      console.error('Error fetching story:', error);
    } finally {
      isLoading = false;
    }
  }

  async function submitWord() {
    if (!wordInput.trim()) {
      errorMessage = 'Please enter a word';
      return;
    }

    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    // Save contributor info to localStorage
    if (typeof localStorage !== 'undefined') {
      if (contributorName.trim()) {
        localStorage.setItem('oneWordStoryContributorName', contributorName.trim());
      }
      if (contributorUrl.trim()) {
        localStorage.setItem('oneWordStoryContributorUrl', contributorUrl.trim());
      }
    }

    try {
      const response = await fetch('/api/one-word-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: wordInput.trim(),
          contributorId: contributorId,
          contributorName: contributorName.trim() || undefined,
          contributorUrl: contributorUrl.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        story = data.story.words || '';
        wordCount = data.story.wordCount || 0;
        storyId = data.story.storyId;
        wordInput = '';
        successMessage = 'Word added successfully!';

        if (data.storyCompleted) {
          successMessage = `🎉 Story completed with ${data.completedStory.wordCount} words! A pull request has been created. Starting a new story...`;
        }

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

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !isSubmitting) {
      submitWord();
    }
  }

  function getWordsRemaining() {
    return Math.max(0, 900 - wordCount);
  }

  function getProgressPercentage() {
    return Math.min(100, (wordCount / 900) * 100);
  }
</script>

<div class="one-word-story">
  <div class="story-header">
    <h2>One Word Story</h2>
    <p class="story-description">
      A collaborative story written one word at a time by the Siblings Write community.
      Contribute your word to help tell the tale!
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

  <div class="story-container">
    {#if isLoading}
      <div class="loading">Loading story...</div>
    {:else if story}
      <div class="story-text">{story}</div>
    {:else}
      <div class="empty-story">Be the first to start the story!</div>
    {/if}
  </div>

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

  <div class="contributor-section">
    <button
      class="toggle-contributor-button"
      on:click={() => showContributorFields = !showContributorFields}
      type="button"
    >
      {showContributorFields ? '▼' : '►'} {contributorName ? `Contributing as ${contributorName}` : 'Add your name (optional)'}
    </button>

    {#if showContributorFields}
      <div class="contributor-fields">
        <div class="field-group">
          <label for="contributor-name">Your Name</label>
          <input
            id="contributor-name"
            type="text"
            bind:value={contributorName}
            placeholder="e.g., Jane Doe"
            disabled={isSubmitting}
            maxlength="50"
            class="contributor-input"
          />
          <span class="field-hint">Your name will appear in the credits when the story is complete</span>
        </div>

        <div class="field-group">
          <label for="contributor-url">Your Website or Social Link</label>
          <input
            id="contributor-url"
            type="url"
            bind:value={contributorUrl}
            placeholder="https://example.com or https://twitter.com/username"
            disabled={isSubmitting}
            maxlength="200"
            class="contributor-input"
          />
          <span class="field-hint">Optional: Link to your website, Twitter, LinkedIn, etc.</span>
        </div>
      </div>
    {/if}
  </div>

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
    margin-bottom: 1rem;
    color: var(--text-color);
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
    color: var(--accent-color, #4a9eff);
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
    background-color: var(--bg-secondary, #f0f0f0);
    border-radius: 4px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, #4a9eff, #7b2cbf);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .story-container {
    background-color: var(--bg-secondary, #f9f9f9);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    min-height: 200px;
    border: 2px solid var(--border-color, #e0e0e0);
  }

  .story-text {
    font-size: 1.2rem;
    line-height: 1.8;
    color: var(--text-color);
    text-align: justify;
  }

  .loading, .empty-story {
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
    padding: 3rem 0;
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
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background-color: var(--bg-primary, #ffffff);
    color: var(--text-color);
    transition: border-color 0.2s;
  }

  .word-input:focus {
    outline: none;
    border-color: var(--accent-color, #4a9eff);
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
    background-color: var(--accent-color, #4a9eff);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .submit-button:hover:not(:disabled) {
    background-color: var(--accent-color-hover, #3a8eef);
    transform: translateY(-1px);
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .contributor-section {
    margin-bottom: 1.5rem;
  }

  .toggle-contributor-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
  }

  .toggle-contributor-button:hover {
    color: var(--text-color);
  }

  .contributor-fields {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--bg-secondary, #f9f9f9);
    border-radius: 4px;
    border: 1px solid var(--border-color, #e0e0e0);
  }

  .field-group {
    margin-bottom: 1rem;
  }

  .field-group:last-child {
    margin-bottom: 0;
  }

  .field-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }

  .contributor-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background-color: var(--bg-primary, #ffffff);
    color: var(--text-color);
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .contributor-input:focus {
    outline: none;
    border-color: var(--accent-color, #4a9eff);
  }

  .contributor-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .field-hint {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
    font-style: italic;
  }

  .message {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .error-message {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
  }

  .success-message {
    background-color: #efe;
    color: #3a3;
    border: 1px solid #cfc;
  }

  .story-rules {
    background-color: var(--bg-secondary, #f9f9f9);
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    border: 1px solid var(--border-color, #e0e0e0);
  }

  .story-rules h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
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
