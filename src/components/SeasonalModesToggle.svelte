<script>
  import { onMount } from 'svelte';

  const rootEl = typeof document !== 'undefined' ? document.documentElement : null;
  let season = null; // null means no seasonal theme active
  let mounted = false;
  let dropdownOpen = false;
  let hoveredTheme = null;

  const themes = [
    { id: null, name: 'Default', description: 'Original site theme', icon: '⭐' },
    { id: 'winter', name: 'Winter', description: 'Snowy wonderland with falling snowflakes', icon: '❄️' },
    { id: 'halloween', name: 'Halloween', description: 'Spooky atmosphere with flickering lights', icon: '🎃' },
    { id: 'summer', name: 'Summer', description: 'Warm beach vibes with fireflies', icon: '☀️' },
    { id: 'spring', name: 'Spring', description: 'Blooming flowers and fresh colors', icon: '🌸' }
  ];

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
    const themeName = themes.find(t => t.id === newSeason)?.name || 'Default';
    announceToScreenReader(`${themeName} theme activated`);
    dropdownOpen = false;
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
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

  $: currentTheme = themes.find(t => t.id === season) || themes[0];
</script>

<svelte:window on:click={(e) => {
  if (!e.target.closest('.seasonal-toggle')) {
    closeDropdown();
  }
}} />

<div class="seasonal-toggle">
  <button
    class="toggle-button"
    on:click={toggleDropdown}
    aria-label="Select seasonal theme"
    aria-haspopup="true"
    aria-expanded={dropdownOpen}
  >
    <span class="theme-icon">{currentTheme.icon}</span>
    <span class="theme-name">{currentTheme.name}</span>
    <svg class="chevron" class:open={dropdownOpen} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>

  {#if dropdownOpen}
    <div class="dropdown-menu" role="menu">
      {#each themes as theme}
        <button
          class="theme-option"
          class:active={season === theme.id}
          on:click={() => handleChange(theme.id)}
          on:mouseenter={() => hoveredTheme = theme.id}
          on:mouseleave={() => hoveredTheme = null}
          role="menuitem"
          aria-label={`Switch to ${theme.name} theme`}
        >
          <span class="option-icon">{theme.icon}</span>
          <span class="option-name">{theme.name}</span>
          {#if season === theme.id}
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
        {#if hoveredTheme === theme.id}
          <div class="tooltip" role="tooltip">
            {theme.description}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .seasonal-toggle {
    position: relative;
    display: inline-block;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.95);
    color: #374151;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .toggle-button:hover {
    border-color: #7c3aed;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  }

  .toggle-button:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
    border-color: #7c3aed;
  }

  .theme-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .theme-name {
    color: #1f2937;
    font-weight: 600;
  }

  .chevron {
    transition: transform 0.2s ease;
    color: #6b7280;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 220px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    z-index: 1000;
    animation: dropdown-appear 0.2s ease-out;
  }

  @keyframes dropdown-appear {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .theme-option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    transition: all 0.15s ease;
    text-align: left;
  }

  .theme-option:hover {
    background: #f3f4f6;
  }

  .theme-option:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: -2px;
  }

  .theme-option.active {
    background: #ede9fe;
    color: #7c3aed;
  }

  .option-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .option-name {
    flex: 1;
    font-weight: 500;
  }

  .check-icon {
    color: #7c3aed;
    flex-shrink: 0;
  }

  .tooltip {
    position: absolute;
    left: calc(100% + 0.75rem);
    top: 50%;
    transform: translateY(-50%);
    background: #1f2937;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    animation: tooltip-appear 0.15s ease-out;
    pointer-events: none;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: #1f2937;
  }

  @keyframes tooltip-appear {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  @media (max-width: 768px) {
    .toggle-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .theme-name {
      display: none;
    }

    .dropdown-menu {
      min-width: 180px;
      right: -0.5rem;
    }

    .tooltip {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .toggle-button {
      padding: 0.4rem 0.6rem;
    }

    .theme-icon {
      font-size: 1.1rem;
    }

    .dropdown-menu {
      min-width: 160px;
    }

    .theme-option {
      padding: 0.6rem 0.75rem;
    }

    .option-icon {
      font-size: 1.25rem;
    }
  }
</style>
