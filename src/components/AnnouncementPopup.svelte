<!-- A whimsical popup announcement component -->
<script>
  export let title = '';
  export let description = '';
  export let image = '';
  export let ctaText = 'Preorder Now!';
  export let ctaLink = '#';
  export let showOnce = true;

  let isVisible = false;
  let isClosing = false;

  // Check if we should show the popup
  function shouldShowPopup() {
    if (!showOnce) return true;

    // Check sessionStorage to see if already shown
    const hasShown = sessionStorage.getItem('announcement-shown');
    return !hasShown;
  }

  // Show popup after a short delay
  function showPopup() {
    if (shouldShowPopup()) {
      setTimeout(() => {
        isVisible = true;
        document.body.style.overflow = 'hidden';
      }, 1000);
    }
  }

  // Close the popup with animation
  function closePopup() {
    isClosing = true;
    setTimeout(() => {
      isVisible = false;
      isClosing = false;
      document.body.style.overflow = '';

      if (showOnce) {
        sessionStorage.setItem('announcement-shown', 'true');
      }
    }, 300);
  }

  // Handle escape key
  function handleKeydown(event) {
    if (event.key === 'Escape' && isVisible) {
      closePopup();
    }
  }

  // Show popup on mount
  import { onMount } from 'svelte';
  onMount(() => {
    showPopup();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isVisible}
  <div class="popup-overlay" class:closing={isClosing} on:click={closePopup}>
    <div class="popup-content" class:closing={isClosing} on:click|stopPropagation>
      <!-- Close button -->
      <button class="close-btn" on:click={closePopup} aria-label="Close announcement">
        ×
      </button>

      <!-- Image -->
      {#if image}
        <div class="popup-image">
          <img src={image} alt={title} />
        </div>
      {/if}

      <!-- Content -->
      <div class="popup-body">
        <h2 class="popup-title">{title}</h2>
        <p class="popup-description">{description}</p>

        <!-- CTA Button -->
        <a href={ctaLink} class="cta-button">
          {ctaText}
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Overlay */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-out;
    padding: 20px;
  }

  .popup-overlay.closing {
    animation: fadeOut 0.3s ease-out;
  }

  /* Popup content container */
  .popup-content {
    background: linear-gradient(135deg, #fff9f0 0%, #ffe8f5 100%);
    border-radius: 30px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    max-width: 500px;
    width: 100%;
    position: relative;
    overflow: hidden;
    animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 3px solid #ffd700;
  }

  .popup-content.closing {
    animation: bounceOut 0.3s ease-out;
  }

  /* Close button */
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%);
    border: 2px solid #fff;
    color: white;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    line-height: 1;
    padding: 0;
  }

  .close-btn:hover {
    transform: rotate(90deg) scale(1.1);
    background: linear-gradient(135deg, #ff4757 0%, #a0485b 100%);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  /* Image */
  .popup-image {
    width: 100%;
    height: 250px;
    overflow: hidden;
    position: relative;
  }

  .popup-image::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    animation: shimmer 3s infinite;
  }

  .popup-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Body content */
  .popup-body {
    padding: 30px;
    text-align: center;
  }

  /* Title */
  .popup-title {
    font-family: var(--font-family-serif, 'Merriweather', serif);
    font-size: 2rem;
    color: #2c3e50;
    margin: 0 0 15px 0;
    text-shadow: 2px 2px 4px rgba(255, 215, 0, 0.3);
    animation: wiggle 2s ease-in-out infinite;
  }

  /* Description */
  .popup-description {
    font-family: var(--font-family-sans, 'Fira Sans', sans-serif);
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
    margin: 0 0 25px 0;
  }

  /* CTA Button */
  .cta-button {
    display: inline-block;
    padding: 15px 40px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #2c3e50;
    font-family: var(--font-family-sans, 'Fira Sans', sans-serif);
    font-size: 1.2rem;
    font-weight: bold;
    text-decoration: none;
    border-radius: 50px;
    border: 3px solid #ffa500;
    box-shadow:
      0 8px 15px rgba(255, 165, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.5);
    transition: all 0.3s ease;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
  }

  .cta-button::before {
    content: '✨';
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    animation: sparkle 1.5s infinite;
  }

  .cta-button::after {
    content: '✨';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    animation: sparkle 1.5s infinite 0.75s;
  }

  .cta-button:hover {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
    box-shadow:
      0 12px 20px rgba(255, 165, 0, 0.4),
      0 0 30px rgba(255, 215, 0, 0.7);
  }

  .cta-button:active {
    transform: translateY(-1px) scale(1.02);
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
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

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3) translateY(-100px);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes bounceOut {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0.7);
      opacity: 0;
    }
  }

  @keyframes wiggle {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-2deg);
    }
    75% {
      transform: rotate(2deg);
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translateY(-50%) scale(1.2);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .popup-content {
      max-width: 95%;
      border-radius: 20px;
    }

    .popup-image {
      height: 200px;
    }

    .popup-title {
      font-size: 1.6rem;
    }

    .popup-description {
      font-size: 1rem;
    }

    .cta-button {
      font-size: 1rem;
      padding: 12px 30px;
    }

    .popup-body {
      padding: 20px;
    }
  }
</style>
