<script>
  import { onMount } from 'svelte';

  const rootEl = typeof document !== 'undefined' ? document.documentElement : null;
  const seasons = ['winter', 'halloween', 'summer', 'spring'];
  let season = null; // null means no seasonal theme active
  let mounted = false;
  let dropdownOpen = false;
  let toggleButtonEl;
  let dropdownEl;

  onMount(() => {
    mounted = true;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('seasonal-mode')) {
      const saved = localStorage.getItem('seasonal-mode');
      season = saved === 'null' ? null : saved;
    }
    applySeasonalMode(season);
  });

  function handleChange(newSeason, event) {
    if (event) {
      event.stopPropagation();
    }
    season = newSeason;
    localStorage.setItem('seasonal-mode', season === null ? 'null' : season);
    applySeasonalMode(newSeason);
    const message = newSeason === null ? 'Seasonal mode disabled' : `Seasonal mode changed to ${newSeason}`;
    announceToScreenReader(message);
    dropdownOpen = false;
  }

  function clearSeasonalMode(event) {
    if (event) {
      event.stopPropagation();
    }
    handleChange(null, event);
  }

  function announceToScreenReader(message) {
    if (typeof document === 'undefined') return;

    // Create or get announcement element
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

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    } else if (event.key === 'Escape') {
      dropdownOpen = false;
      toggleButtonEl?.focus();
    } else if (event.key === 'ArrowDown' && !dropdownOpen) {
      event.preventDefault();
      dropdownOpen = true;
    }
  }

  function handleOptionKeyDown(event, s) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      handleChange(s, event);
      toggleButtonEl?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      dropdownOpen = false;
      toggleButtonEl?.focus();
    }
  }

  function handleClickOutside(event) {
    if (dropdownOpen && dropdownEl && !dropdownEl.contains(event.target) && !toggleButtonEl?.contains(event.target)) {
      dropdownOpen = false;
    }
  }

  function applySeasonalMode(mode) {
    if (!rootEl) return;

    // Remove all seasonal classes
    seasons.forEach(s => {
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

  const icons = {
    winter: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2L9 3v5H6L4 10l2 2h3v5l1 1 1-1v-5h3l2-2-2-2h-3V3l-1-1z"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </svg>`,
    halloween: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2c-3 0-5 2-6 4-1 2-1 4 0 6 0 1 1 2 2 3l1 1c1 1 2 2 3 2s2-1 3-2l1-1c1-1 2-2 2-3 1-2 1-4 0-6-1-2-3-4-6-4zm-2 8a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"/>
    </svg>`,
    summer: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
    </svg>`,
    spring: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3c-2 0-3 1-3 3 0 1 0 2 1 3-1 0-2 1-2 2s1 2 2 2c0 1 1 2 2 2s2-1 2-2c1 0 2-1 2-2s-1-2-2-2c1-1 1-2 1-3 0-2-1-3-3-3z"/>
      <circle cx="7" cy="8" r="1" fill="currentColor"/>
      <circle cx="13" cy="8" r="1" fill="currentColor"/>
      <circle cx="10" cy="13" r="1" fill="currentColor"/>
    </svg>`
  };
</script>

<svelte:window on:click={handleClickOutside} />

<div class="seasonal-toggle">
  <button
    bind:this={toggleButtonEl}
    class="toggle-button"
    on:click={toggleDropdown}
    on:keydown={handleKeyDown}
    title={season ? `Current seasonal theme: ${season}. Click to change` : 'Choose a seasonal theme'}
    aria-label={season ? `Seasonal themes. Current: ${season}. Press Enter to open menu` : 'Seasonal themes. Press Enter to open menu'}
    aria-haspopup="true"
    aria-expanded={dropdownOpen}
  >
    {#if season}
      {@html icons[season]}
      <span class="mode-label">{season}</span>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd" />
      </svg>
      <span class="mode-label">Themes</span>
    {/if}
  </button>

  {#if season}
    <button
      class="clear-button"
      on:click={clearSeasonalMode}
      title="Remove seasonal theme"
      aria-label="Remove seasonal theme"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  {/if}

  <div
    bind:this={dropdownEl}
    class="mode-dropdown {dropdownOpen ? 'open' : ''}"
    role="menu"
    aria-label="Seasonal theme options"
  >
    {#each seasons as s}
      <button
        class="mode-option {season === s ? 'active' : ''}"
        on:click={(e) => handleChange(s, e)}
        on:keydown={(e) => handleOptionKeyDown(e, s)}
        role="menuitem"
        title={`Switch to ${s} theme`}
        aria-label={`Switch to ${s} theme${season === s ? ' (current)' : ''}`}
        aria-current={season === s ? 'true' : 'false'}
        tabindex={dropdownOpen ? 0 : -1}
      >
        {@html icons[s]}
        <span>{s}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .seasonal-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color, #7c3aed);
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
  }

  .toggle-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  }

  .toggle-button:active {
    transform: translateY(0);
  }

  /* Visible focus indicator for accessibility */
  .toggle-button:focus {
    outline: 3px solid #fbbf24;
    outline-offset: 2px;
  }

  .toggle-button:focus:not(:focus-visible) {
    outline: none;
  }

  .toggle-button:focus-visible {
    outline: 3px solid #fbbf24;
    outline-offset: 2px;
  }

  .mode-label {
    text-transform: capitalize;
  }

  .clear-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-button:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: #dc2626;
    transform: scale(1.1);
  }

  .clear-button:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }

  .clear-button:focus:not(:focus-visible) {
    outline: none;
  }

  .clear-button:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }

  .mode-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    min-width: 150px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .seasonal-toggle:hover .mode-dropdown,
  .mode-dropdown.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #2d2d3f;
    transition: all 0.2s ease;
    text-transform: capitalize;
  }

  .mode-option:hover {
    background: #f3f4f6;
  }

  .mode-option:focus {
    outline: 2px solid #7c3aed;
    outline-offset: -2px;
    background: #f3f4f6;
  }

  .mode-option:focus:not(:focus-visible) {
    outline: none;
  }

  .mode-option:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: -2px;
    background: #f3f4f6;
  }

  .mode-option.active {
    background: var(--primary-color, #7c3aed);
    color: white;
  }

  .mode-option.active:focus,
  .mode-option.active:focus-visible {
    outline-color: #fbbf24;
  }

  .mode-option span {
    flex: 1;
    text-align: left;
  }

  @media (max-width: 768px) {
    .toggle-button {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
    }

    .mode-label {
      display: none;
    }
  }
</style>
