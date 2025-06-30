// Simplest possible menu toggle implementation
document.addEventListener('DOMContentLoaded', setupMenuToggle);
document.addEventListener('astro:page-load', setupMenuToggle);
function setupMenuToggle() {
  const hamburger = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  
    if (!hamburger || !mobileNav) return;

  // Remove existing event listeners
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);

  // Add click event listener
    newHamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileNav.classList.toggle('active');
      
      if (mobileNav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      addOverlay();
      } else {
        document.body.style.overflow = '';
        removeOverlay();
      }
    });
  }

function addOverlay() {
    removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'mobile-nav-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '999';
  
  overlay.addEventListener('click', function() {
    const hamburger = document.getElementById('hamburger-menu');
      if (hamburger) hamburger.click();
  });
  
  document.body.appendChild(overlay);
}

function removeOverlay() {
  const overlay = document.getElementById('mobile-nav-overlay');
    if (overlay) overlay.remove();
  }

// Run immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setupMenuToggle();
}
