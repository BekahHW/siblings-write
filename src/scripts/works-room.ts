declare global {
  interface Window {
    __worksRoom?: boolean;
  }
}

if (!window.__worksRoom) {
  window.__worksRoom = true;

  let watcher: IntersectionObserver | null = null;
  let refreshShelf: (() => void) | null = null;

  window.addEventListener('resize', () => refreshShelf?.());

  function pauseOffscreen() {
    watcher?.disconnect();
    if (!('IntersectionObserver' in window)) return;

    watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        });
      },
      { rootMargin: '120px' },
    );

    document.querySelectorAll('[data-animated]').forEach((element) => {
      watcher?.observe(element);
    });
  }

  function wireShelfScroll() {
    const scroller = document.querySelector<HTMLElement>('[data-shelf-scroll]');
    const previous = document.querySelector<HTMLElement>('[data-shelf-prev]');
    const next = document.querySelector<HTMLElement>('[data-shelf-next]');
    refreshShelf = null;
    if (!scroller || !previous || !next) return;

    function step() {
      const card = scroller!.querySelector<HTMLElement>('.book-card');
      const row = scroller!.querySelector<HTMLElement>('.books-row');
      const gap = row ? parseFloat(getComputedStyle(row).gap) || 20 : 20;
      return card ? Math.round(card.getBoundingClientRect().width + gap) : 160;
    }

    function update() {
      const room = scroller!.scrollWidth - scroller!.clientWidth;
      const scrollable = room > 12;
      previous!.classList.toggle('is-available', scrollable && scroller!.scrollLeft > 4);
      next!.classList.toggle(
        'is-available',
        scrollable && scroller!.scrollLeft < room - 4,
      );
    }

    if (!scroller.dataset.bound) {
      scroller.dataset.bound = '1';
      previous.addEventListener('click', () => {
        scroller.scrollBy({ left: -step(), behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        scroller.scrollBy({ left: step(), behavior: 'smooth' });
      });
      scroller.addEventListener('scroll', update, { passive: true });
    }

    refreshShelf = update;
    update();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', update, { once: true });
    }
  }

  function wireShelf() {
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
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timers: ReturnType<typeof setTimeout>[] = [];
    let inflight: { current: HTMLElement; next: HTMLElement } | null = null;

    function markTabs(id: string, focusTab: boolean) {
      tabs.forEach((tab) => {
        const selected = tab.dataset.book === id;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focusTab) {
          tab.focus();
          tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    function settle() {
      timers.forEach(clearTimeout);
      timers = [];
      if (inflight) {
        inflight.current.hidden = true;
        inflight.next.hidden = false;
        inflight = null;
      }
      reader.classList.remove('is-stacking', 'is-turning', 'is-resizing');
      reader.style.height = '';
      spreads.forEach((spread) => {
        spread.classList.remove('is-outgoing', 'is-incoming', 'clip-right', 'clip-left');
      });
      face?.replaceChildren();
      back?.replaceChildren();
    }

    function open(id: string, focusTab: boolean) {
      markTabs(id, focusTab);
      settle();

      const next = document.getElementById(`spread-${id}`);
      const current = spreads.find((spread) => !spread.hidden);
      if (!next || next === current) return;

      if (still.matches || !leaf || !face || !back || !current) {
        if (current) current.hidden = true;
        next.hidden = false;
        return;
      }

      const forward = spreads.indexOf(next) > spreads.indexOf(current);
      const lifted = forward ? '.spread-page--right' : '.spread-page--left';
      const landed = forward ? '.spread-page--left' : '.spread-page--right';
      face.replaceChildren(current.querySelector(lifted)!.cloneNode(true));
      back.replaceChildren(next.querySelector(landed)!.cloneNode(true));
      leaf.className = `page-leaf page-leaf--${forward ? 'forward' : 'back'}`;

      reader.classList.add('is-stacking');
      next.hidden = false;
      inflight = { current, next };
      current.classList.add('is-outgoing');
      next.classList.add('is-incoming', forward ? 'clip-right' : 'clip-left');
      reader.style.height = `${Math.max(current.offsetHeight, next.offsetHeight)}px`;

      requestAnimationFrame(() => {
        reader.classList.add('is-turning');
        timers.push(
          setTimeout(() => {
            next.classList.remove('clip-right', 'clip-left');
            current.hidden = true;
            current.classList.remove('is-outgoing');
            inflight = null;
          }, TURN * 0.75),
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
              }, 280),
            );
          }, TURN),
        );
      });
    }

    shelf.addEventListener('click', (event) => {
      const target = event.target;
      const tab = target instanceof Element
        ? target.closest<HTMLElement>('[role="tab"]')
        : null;
      if (tab?.dataset.book) open(tab.dataset.book, false);
    });

    shelf.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(document.activeElement as HTMLElement);
      if (index < 0) return;
      let next: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        next = (index + 1) % tabs.length;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        next = (index - 1 + tabs.length) % tabs.length;
      }
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      const id = tabs[next].dataset.book;
      if (id) open(id, true);
    });
  }

  function setup() {
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
  }

  document.addEventListener('astro:page-load', setup);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}

export {};
