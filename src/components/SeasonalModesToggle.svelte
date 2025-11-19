<script>
  import { onMount } from 'svelte';

  const rootEl = typeof document !== 'undefined' ? document.documentElement : null;
  let season = null; // null means no seasonal theme active
  let mounted = false;

  onMount(() => {
    mounted = true;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('seasonal-mode')) {
      const saved = localStorage.getItem('seasonal-mode');
      season = saved === 'null' ? null : saved;
    }
    applySeasonalMode(season);
  });

  function handleChange(newSeason) {
    season = newSeason;
    localStorage.setItem('seasonal-mode', season === null ? 'null' : season);
    applySeasonalMode(newSeason);
    const message = newSeason === null ? 'Default theme' : `${newSeason} theme activated`;
    announceToScreenReader(message);
  }

  function announceToScreenReader(message) {
    if (typeof document === 'undefined') return;

    let announcer = document.getElementById('seasonal-mode-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'seasonal-mode-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }

    announcer.textContent = message;
  }

  function applySeasonalMode(mode) {
    if (!rootEl) return;

    // Remove all seasonal classes
    const allSeasons = ['winter', 'halloween', 'summer', 'spring'];
    allSeasons.forEach(s => {
      rootEl.classList.remove(`season-${s}`);
    });

    // Add the selected seasonal class
    if (mode !== null) {
      rootEl.classList.add(`season-${mode}`);
    }

    // Trigger animation effects
    triggerSeasonalEffects(mode);
  }

  function triggerSeasonalEffects(mode) {
    if (typeof document === 'undefined') return;

    // Remove existing effects
    const existingEffects = document.querySelector('.seasonal-effects');
    if (existingEffects) {
      existingEffects.remove();
    }

    if (mode === null) return;

    // Create effects container
    const effectsContainer = document.createElement('div');
    effectsContainer.className = 'seasonal-effects';
    effectsContainer.setAttribute('aria-hidden', 'true');

    if (mode === 'winter') {
      createSnowflakes(effectsContainer);
    } else if (mode === 'summer') {
      createFireflies(effectsContainer);
    } else if (mode === 'spring') {
      createFlowers(effectsContainer);
    } else if (mode === 'halloween') {
      createSpookyLights(effectsContainer);
    }

    document.body.appendChild(effectsContainer);
  }

  function createSnowflakes(container) {
    const snowflakeCount = 50;
    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
      snowflake.style.animationDelay = Math.random() * 5 + 's';
      snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
      snowflake.style.opacity = Math.random() * 0.6 + 0.4;
      container.appendChild(snowflake);
    }
  }

  function createFireflies(container) {
    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'firefly';
      firefly.style.left = Math.random() * 100 + '%';
      firefly.style.top = Math.random() * 100 + '%';
      firefly.style.animationDuration = (Math.random() * 3 + 2) + 's';
      firefly.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(firefly);
    }
  }

  function createFlowers(container) {
    const flowerCount = 15;
    const flowerEmojis = ['🌸', '🌺', '🌻', '🌷', '🌼'];
    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement('div');
      flower.className = 'flower';
      flower.innerHTML = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
      flower.style.left = Math.random() * 100 + '%';
      flower.style.bottom = '-50px';
      flower.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(flower);
    }
  }

  function createSpookyLights(container) {
    const lightCount = 8;
    for (let i = 0; i < lightCount; i++) {
      const light = document.createElement('div');
      light.className = 'spooky-light';
      light.style.left = (i * 12.5) + '%';
      light.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(light);
    }
  }
</script>

<div class="seasonal-toggle-bar">
  <!-- Default/Star -->
  <button
    class="theme-btn {season === null ? 'active' : ''}"
    on:click={() => handleChange(null)}
    title="Default theme"
    aria-label="Default theme"
    aria-pressed={season === null}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
    </svg>
  </button>

  <!-- Winter/Snowflake -->
  <button
    class="theme-btn {season === 'winter' ? 'active' : ''}"
    on:click={() => handleChange('winter')}
    title="Winter theme"
    aria-label="Winter theme"
    aria-pressed={season === 'winter'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L11 4v7H4L2 12l2 1h7v7l1 1 1-1v-7h7l2-1-2-1h-7V4l-1-1z"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  </button>

  <!-- Halloween/Pumpkin -->
  <button
    class="theme-btn {season === 'halloween' ? 'active' : ''}"
    on:click={() => handleChange('halloween')}
    title="Halloween theme"
    aria-label="Halloween theme"
    aria-pressed={season === 'halloween'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4 0-7 3-8 5-1 3-1 5 0 8 0 1 1 3 3 4l1 1c2 2 3 3 4 3s2-1 4-3l1-1c2-1 3-3 3-4 1-3 1-5 0-8-1-2-4-5-8-5zm-3 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
    </svg>
  </button>

  <!-- Summer/Sun -->
  <button
    class="theme-btn {season === 'summer' ? 'active' : ''}"
    on:click={() => handleChange('summer')}
    title="Summer theme"
    aria-label="Summer theme"
    aria-pressed={season === 'summer'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v2m0 14v2M5.64 5.64l1.41 1.41m9.9 9.9l1.41 1.41M3 12h2m14 0h2M5.64 18.36l1.41-1.41m9.9-9.9l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
  </button>

  <!-- Spring/Flower -->
  <button
    class="theme-btn {season === 'spring' ? 'active' : ''}"
    on:click={() => handleChange('spring')}
    title="Spring theme"
    aria-label="Spring theme"
    aria-pressed={season === 'spring'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4c-2 0-4 2-4 4 0 1 0 3 2 4-2 0-3 1-3 3s1 3 3 3c0 2 2 4 4 4s4-2 4-4c2 0 3-1 3-3s-1-3-3-3c2-1 2-3 2-4 0-2-2-4-4-4z"/>
      <circle cx="9" cy="10" r="1.5"/>
      <circle cx="15" cy="10" r="1.5"/>
      <circle cx="12" cy="16" r="1.5"/>
    </svg>
  </button>
</div>

<style>
  .seasonal-toggle-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    padding: 0.5rem;
    border-radius: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    background: transparent;
    color: #6b7280;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .theme-btn:hover {
    background: rgba(124, 58, 237, 0.1);
    color: #7c3aed;
    transform: scale(1.1);
  }

  .theme-btn:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }

  .theme-btn.active {
    background: var(--primary-color, #7c3aed);
    color: white;
    border-color: var(--primary-color, #7c3aed);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
  }

  .theme-btn.active:hover {
    transform: scale(1.05);
  }

  /* Seasonal color variations for active states */
  .theme-btn.active[aria-label="Winter theme"] {
    background: #2563eb;
    border-color: #2563eb;
  }

  .theme-btn.active[aria-label="Halloween theme"] {
    background: #ff6b35;
    border-color: #ff6b35;
  }

  .theme-btn.active[aria-label="Summer theme"] {
    background: #dc2626;
    border-color: #dc2626;
  }

  .theme-btn.active[aria-label="Spring theme"] {
    background: #059669;
    border-color: #059669;
  }

  .theme-btn.active[aria-label="Default theme"] {
    background: #7c3aed;
    border-color: #7c3aed;
  }

  @media (max-width: 768px) {
    .seasonal-toggle-bar {
      gap: 0.375rem;
      padding: 0.375rem;
    }

    .theme-btn {
      width: 2.25rem;
      height: 2.25rem;
    }
  }

  @media (max-width: 480px) {
    .seasonal-toggle-bar {
      gap: 0.25rem;
      padding: 0.25rem;
    }

    .theme-btn {
      width: 2rem;
      height: 2rem;
    }
  }
</style>
