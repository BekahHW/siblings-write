<!-- Secret keyboard unlock component - listens for "luminary" -->
<script>
  import { onMount } from 'svelte';

  let typedKeys = '';
  let showNotification = false;
  let notificationMessage = '';
  let notificationType = 'success'; // 'success' or 'error'
  let isClosing = false;

  const SECRET_WORD = 'luminary';
  const RESET_TIMEOUT = 2000; // Reset typed keys after 2 seconds of inactivity
  let resetTimer;

  function isSubscriber() {
    // Check if user is a subscriber
    const subscriber = localStorage.getItem('siblings-write-subscriber');
    return subscriber === 'true';
  }

  function handleKeyPress(event) {
    // Ignore if user is typing in an input field
    if (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable) {
      return;
    }

    // Add the typed character (lowercase)
    typedKeys += event.key.toLowerCase();

    // Clear the reset timer and start a new one
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      typedKeys = '';
    }, RESET_TIMEOUT);

    // Check if the secret word has been typed
    if (typedKeys.includes(SECRET_WORD)) {
      typedKeys = ''; // Reset
      clearTimeout(resetTimer);
      checkAccessAndRedirect();
    }

    // Limit the buffer to prevent memory issues
    if (typedKeys.length > 20) {
      typedKeys = typedKeys.slice(-20);
    }
  }

  function checkAccessAndRedirect() {
    if (isSubscriber()) {
      // Show success notification and redirect
      showSuccessNotification();
      setTimeout(() => {
        window.location.href = '/author-console';
      }, 1500);
    } else {
      // Show error notification prompting to subscribe
      showErrorNotification();
    }
  }

  function showSuccessNotification() {
    notificationMessage = '✨ Secret unlocked! Opening Author Console...';
    notificationType = 'success';
    showNotification = true;
    isClosing = false;

    // Auto-close after animation
    setTimeout(() => {
      closeNotification();
    }, 3000);
  }

  function showErrorNotification() {
    notificationMessage = '🔒 You found the secret! Subscribe to unlock the Author Console.';
    notificationType = 'error';
    showNotification = true;
    isClosing = false;

    // Auto-close after longer delay
    setTimeout(() => {
      closeNotification();
    }, 5000);
  }

  function closeNotification() {
    isClosing = true;
    setTimeout(() => {
      showNotification = false;
      isClosing = false;
    }, 300);
  }

  onMount(() => {
    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(resetTimer);
    };
  });
</script>

{#if showNotification}
  <div class="notification-overlay" class:closing={isClosing}>
    <div class="notification {notificationType}" class:closing={isClosing}>
      <button class="close-btn" on:click={closeNotification} aria-label="Close notification">
        ×
      </button>
      <p>{notificationMessage}</p>
      {#if notificationType === 'error'}
        <a href="/subscribe" class="subscribe-link">Subscribe Now →</a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .notification-overlay {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    animation: slideDown 0.3s ease-out;
  }

  .notification-overlay.closing {
    animation: slideUp 0.3s ease-out;
  }

  .notification {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    min-width: 300px;
    max-width: 500px;
    position: relative;
    animation: bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .notification.error {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .notification.closing {
    animation: fadeOut 0.3s ease-out;
  }

  .notification p {
    margin: 0;
    font-family: var(--font-family-sans, 'Fira Sans', sans-serif);
    font-size: 1.1rem;
    line-height: 1.4;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .close-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    line-height: 1;
    padding: 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  .subscribe-link {
    display: inline-block;
    margin-top: 12px;
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    text-decoration: none;
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    font-family: var(--font-family-sans, 'Fira Sans', sans-serif);
    font-size: 0.95rem;
    font-weight: bold;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .subscribe-link:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }

  @keyframes bounce {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @media (max-width: 600px) {
    .notification {
      min-width: 250px;
      padding: 15px 20px;
    }

    .notification p {
      font-size: 1rem;
    }
  }
</style>
