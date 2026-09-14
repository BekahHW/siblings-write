import { wireLibraryDeparture } from './library-departure';
import { wireLibraryMemory } from './library-memory';
import { wireLibraryTreeSecret } from './library-tree-secret';
import { wireLibraryAmbientEvents } from './library-ambient-events';
import { wireLibraryParallax } from './library-parallax';
import { commitLibraryWorld, wireLibraryWorld } from './library-world';

/**
 * Bookshelf, page-turn reader, shelf scroll, and offscreen animation pausing
 * for /works. Re-binds on astro:page-load after view transitions.
 */
declare global {
  interface Window {
    __worksRoom?: boolean;
  }
}

export function initWorksRoom(): void {
  if (window.__worksRoom) return;
  window.__worksRoom = true;

  let watcher: IntersectionObserver | null = null;
  let refreshShelf: (() => void) | null = null;

  window.addEventListener('resize', () => {
    refreshShelf?.();
  });

  function pauseOffscreen(): void {
    watcher?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        });
      },
      { rootMargin: '120px' }
    );
    document.querySelectorAll('[data-animated]').forEach((el) => {
      watcher!.observe(el);
    });
  }

  function wireShelfScroll(): (() => void) | null {
    const scroller = document.querySelector<HTMLElement>('[data-shelf-scroll]');
    const prev = document.querySelector<HTMLElement>('[data-shelf-prev]');
    const next = document.querySelector<HTMLElement>('[data-shelf-next]');
    refreshShelf = null;
    if (!scroller || !prev || !next) return null;

    function step(): number {
      const card = scroller!.querySelector('.book-card');
      const row = scroller!.querySelector('.books-row');
      const gap = row ? parseFloat(getComputedStyle(row).gap) || 20 : 20;
      return card ? Math.round(card.getBoundingClientRect().width + gap) : 160;
    }

    function update(): void {
      const room = scroller!.scrollWidth - scroller!.clientWidth;
      const scrollable = room > 12;
      prev!.classList.toggle('is-available', scrollable && scroller!.scrollLeft > 4);
      next!.classList.toggle('is-available', scrollable && scroller!.scrollLeft < room - 4);
    }

    if (!scroller.dataset.bound) {
      scroller.dataset.bound = '1';
      prev.addEventListener('click', () => {
        scroller!.scrollBy({ left: -step(), behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        scroller!.scrollBy({ left: step(), behavior: 'smooth' });
      });
      scroller.addEventListener('scroll', update, { passive: true });
    }

    refreshShelf = update;
    update();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', update, { once: true });
    }
    return update;
  }

  function wireShelf(): void {
    const shelf = document.querySelector<HTMLElement>('[data-shelf]');
    const reader = document.querySelector<HTMLElement>('[data-reader]');
    if (!shelf || !reader || shelf.dataset.bound) return;
    shelf.dataset.bound = '1';

    const TURN = 540;
    const tabs = Array.from(shelf.querySelectorAll<HTMLElement>('[role="tab"]'));
    const spreads = Array.from(reader.querySelectorAll<HTMLElement>('.spread'));
    const leaf = reader.querySelector<HTMLElement>('.page-leaf');
    const face = leaf?.querySelector<HTMLElement>('.page-leaf-face');
    const back = leaf?.querySelector<HTMLElement>('.page-leaf-back');
    let timers: ReturnType<typeof setTimeout>[] = [];
    let inflight: { current: HTMLElement; next: HTMLElement } | null = null;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    function markTabs(id: string, focusTab: boolean): void {
      tabs.forEach((tab) => {
        const on = tab.dataset.book === id;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (!on) return;
        if (focusTab) {
          tab.focus();
          tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    function settle(): void {
      timers.forEach(clearTimeout);
      timers = [];
      if (inflight) {
        inflight.current.hidden = true;
        inflight.next.hidden = false;
        inflight = null;
      }
      reader!.classList.remove('is-stacking', 'is-turning', 'is-resizing');
      reader!.style.height = '';
      spreads.forEach((spread) => {
        spread.classList.remove('is-outgoing', 'is-incoming', 'clip-right', 'clip-left');
      });
      face?.replaceChildren();
      back?.replaceChildren();
    }

    function open(id: string, focusTab: boolean): void {
      markTabs(id, focusTab);
      const activeTab = tabs.find((tab) => tab.dataset.book === id);
      if (activeTab?.dataset.world) commitLibraryWorld(activeTab.dataset.world);
      settle();

      const next = document.getElementById(`spread-${id}`) as HTMLElement | null;
      const current = spreads.find((s) => !s.hidden);
      if (!next || next === current) return;

      if (still.matches || !leaf || !face || !back || !current) {
        if (current) current.hidden = true;
        next.hidden = false;
        return;
      }

      const forward = spreads.indexOf(next) > spreads.indexOf(current);
      const lifted = forward ? '.spread-page--right' : '.spread-page--left';
      const landed = forward ? '.spread-page--left' : '.spread-page--right';

      const liftedEl = current.querySelector(lifted);
      const landedEl = next.querySelector(landed);
      if (!liftedEl || !landedEl) {
        if (current) current.hidden = true;
        next.hidden = false;
        return;
      }

      face.replaceChildren(liftedEl.cloneNode(true));
      back.replaceChildren(landedEl.cloneNode(true));
      leaf.className = `page-leaf page-leaf--${forward ? 'forward' : 'back'}`;

      reader.classList.add('is-stacking');
      next.hidden = false;
      inflight = { current, next };
      current.classList.add('is-outgoing');
      next.classList.add('is-incoming', forward ? 'clip-right' : 'clip-left');

      const tall = Math.max(current.offsetHeight, next.offsetHeight);
      reader.style.height = `${tall}px`;

      requestAnimationFrame(() => {
        reader.classList.add('is-turning');

        timers.push(
          setTimeout(() => {
            next.classList.remove('clip-right', 'clip-left');
            current.hidden = true;
            current.classList.remove('is-outgoing');
            inflight = null;
          }, TURN * 0.75)
        );

        timers.push(
          setTimeout(() => {
            reader.classList.remove('is-turning', 'is-stacking');
            next.classList.remove('is-incoming');
            face.replaceChildren();
            back.replaceChildren();
            reader.classList.add('is-resizing');
            reader.style.height = `${next.offsetHeight}px`;
            timers.push(
              setTimeout(() => {
                reader.classList.remove('is-resizing');
                reader.style.height = '';
              }, 280)
            );
          }, TURN)
        );
      });
    }

    shelf.addEventListener('click', (event) => {
      const tab = (event.target as Element | null)?.closest('[role="tab"]') as HTMLElement | null;
      if (tab?.dataset.book) open(tab.dataset.book, false);
    });

    shelf.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(document.activeElement as HTMLElement);
      if (index < 0) return;
      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      const book = tabs[nextIndex]?.dataset.book;
      if (book) open(book, true);
    });
  }

  function setup(): void {
    const inRoom = Boolean(document.querySelector('.library'));
    document.body.classList.toggle('works-room', inRoom);
    if (!inRoom) {
      watcher?.disconnect();
      watcher = null;
      return;
    }
    pauseOffscreen();
    wireShelfScroll();
    wireShelf();
    wireLibraryWorld();
    wireLibraryParallax();
    wireLibraryAmbientEvents();
    wireLibraryMemory();
    wireLibraryDeparture();
    wireLibraryTreeSecret();
  }

  document.addEventListener('astro:page-load', setup);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}

initWorksRoom();
