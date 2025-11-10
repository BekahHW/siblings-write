<!-- A Svelte component for mobile navigation -->
<script>
  import ThemeToggleButton from './ThemeToggleButton.svelte';
  
  export let current = '';
  
  let menuOpen = false;
  
  function toggleMenu() {
    menuOpen = !menuOpen;
    
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
</script>

<div class="mobile-nav-container">
<button class="hamburger" class:active={menuOpen} on:click={toggleMenu} aria-label="Menu">
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>
  </div>

{#if menuOpen}
  <div class="mobile-overlay" on:click={toggleMenu}></div>
{/if}

<nav class="mobile-nav" class:active={menuOpen}>
  <a class={current === "" ? "selected" : ""} href='/'>home</a>
  <a class={current === "blog" ? "selected" : ""} href='/blog'>shorts</a>
  <a class={current === "one-word-story" ? "selected" : ""} href='/one-word-story'>collab</a>
  <a class={current === "works" ? "selected" : ""} href='/works'>works</a>
  <a class={current === "subscribe" ? "selected" : ""} href='/subscribe'>subscribe</a>
  <a class={current === "contact" ? "selected" : ""} href='/contact'>contact</a>
  <div class="theme-toggle-container mobile-theme-toggle">
    <ThemeToggleButton />
  </div>
</nav>

<style>
  .mobile-nav-container {
    display: none;
  }

  /* Hamburger button styles */
    .hamburger {
    cursor: pointer;
    background-color: transparent;
    border: 0;
    padding: 0;
    z-index: 1001;
    margin-left: 20px;
    }

  .hamburger-line {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px 0;
    background-color: var(--text-main);
    transition: transform 0.3s ease;
  }
  
  /* Active hamburger state */
  .hamburger.active .hamburger-line:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .hamburger.active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active .hamburger-line:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  /* Mobile navigation styles */
  .mobile-nav {
    display: none;
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    height: 100vh;
    background-color: var(--background-body);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transition: right 0.3s ease;
    padding-top: 70px;
    flex-direction: column;
  }
  
  .mobile-nav.active {
    right: 0;
    display: flex;
  }
  
  .mobile-nav a {
    margin: 0;
    padding: 15px;
    width: 100%;
    text-align: center;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    font-size: 1.2rem;
    color: inherit;
    text-decoration: none;
    font-family: var(--font-family-sans);
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .mobile-nav a.selected {
    background-color: rgba(128, 128, 128, 0.1);
  }
  
  .mobile-nav a.selected::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: var(--primary-color);
    transform: scaleX(1);
  }

  .mobile-theme-toggle {
    margin: 20px auto;
  }
  
  /* Mobile overlay */
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
  }

  @media screen and (max-width: 768px) {
    .mobile-nav-container {
      display: block;
    }
  }
</style>