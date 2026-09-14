import {
  canRunAmbientEvent,
  eligibleRareEvents,
  initialLibraryState,
  isLibraryWorld,
  libraryPhase,
  reduceLibraryState,
  visibleLibraryWorld,
  type LibraryAction,
  type LibraryState,
  type LibraryWorld,
  type RareEvent,
} from './library-state';

declare global {
  interface Window {
    __worksRoom?: boolean;
    __worksRoomCleanup?: () => void;
  }
}

class LibraryStateController {
  private state: LibraryState;
  private previewTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private root: HTMLElement, initialWorld: LibraryWorld) {
    this.state = initialLibraryState(initialWorld);
    this.render();
  }

  get current() {
    return this.state;
  }

  dispatch(action: LibraryAction) {
    this.state = reduceLibraryState(this.state, action);
    this.render();
  }

  schedulePreview(world: LibraryWorld) {
    this.clearPreviewTimer();
    this.previewTimer = setTimeout(() => {
      this.dispatch({ type: 'preview', world });
      this.previewTimer = null;
    }, 180);
  }

  clearPreview() {
    this.clearPreviewTimer();
    this.dispatch({ type: 'clear-preview' });
  }

  beginTurn(world: LibraryWorld) {
    this.clearPreviewTimer();
    this.dispatch({ type: 'begin-turn', world });
  }

  settleTurn(world: LibraryWorld) {
    this.dispatch({ type: 'settle-turn', world });
  }

  destroy() {
    this.clearPreviewTimer();
  }

  private clearPreviewTimer() {
    if (this.previewTimer) clearTimeout(this.previewTimer);
    this.previewTimer = null;
  }

  private render() {
    this.root.dataset.world = visibleLibraryWorld(this.state);
    this.root.dataset.committedWorld = this.state.committed;
    this.root.dataset.libraryState = libraryPhase(this.state);
    this.root.dispatchEvent(new CustomEvent('library-state-change'));
  }
}

function tabWorld(tab: HTMLElement): LibraryWorld | null {
  return isLibraryWorld(tab.dataset.world) ? tab.dataset.world : null;
}

function wireShelfScroll(signal: AbortSignal) {
  const scroller = document.querySelector<HTMLElement>('[data-shelf-scroll]');
  const previous = document.querySelector<HTMLElement>('[data-shelf-prev]');
  const next = document.querySelector<HTMLElement>('[data-shelf-next]');
  if (!scroller || !previous || !next) return () => {};

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
    next!.classList.toggle('is-available', scrollable && scroller!.scrollLeft < room - 4);
  }

  previous.addEventListener('click', () => {
    scroller.scrollBy({ left: -step(), behavior: 'smooth' });
  }, { signal });
  next.addEventListener('click', () => {
    scroller.scrollBy({ left: step(), behavior: 'smooth' });
  }, { signal });
  scroller.addEventListener('scroll', update, { passive: true, signal });
  window.addEventListener('resize', update, { passive: true, signal });
  window.addEventListener('load', update, { once: true, signal });
  update();
  return update;
}

function wireShelf(
  controller: LibraryStateController,
  signal: AbortSignal,
) {
  const shelf = document.querySelector<HTMLElement>('[data-shelf]');
  const reader = document.querySelector<HTMLElement>('[data-reader]');
  if (!shelf || !reader) return () => {};

  const TURN = 540;
  const tabs = Array.from(shelf.querySelectorAll<HTMLElement>('[role="tab"]'));
  const spreads = Array.from(reader.querySelectorAll<HTMLElement>('.spread'));
  const leaf = reader.querySelector<HTMLElement>('.page-leaf');
  const face = leaf?.querySelector<HTMLElement>('.page-leaf-face');
  const back = leaf?.querySelector<HTMLElement>('.page-leaf-back');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canPreview = window.matchMedia('(hover: hover) and (pointer: fine)');
  let timers: ReturnType<typeof setTimeout>[] = [];
  let inflight: { current: HTMLElement; next: HTMLElement } | null = null;

  function markTabs(id: string, focusTab: boolean) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.book === id;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) {
        tab.focus();
        tab.scrollIntoView({
          behavior: still.matches ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    });
  }

  function settlePages() {
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
    const tab = tabs.find((candidate) => candidate.dataset.book === id);
    const world = tab ? tabWorld(tab) : null;
    if (!world) return;

    controller.beginTurn(world);
    markTabs(id, focusTab);
    settlePages();

    const next = document.getElementById(`spread-${id}`);
    const current = spreads.find((spread) => !spread.hidden);
    if (!next || next === current) {
      controller.settleTurn(world);
      return;
    }

    if (still.matches || !leaf || !face || !back || !current) {
      if (current) current.hidden = true;
      next.hidden = false;
      controller.settleTurn(world);
      return;
    }

    const forward = spreads.indexOf(next) > spreads.indexOf(current);
    const lifted = forward ? '.spread-page--right' : '.spread-page--left';
    const landed = forward ? '.spread-page--left' : '.spread-page--right';
    const liftedPage = current.querySelector(lifted);
    const landedPage = next.querySelector(landed);
    if (!liftedPage || !landedPage) {
      current.hidden = true;
      next.hidden = false;
      controller.settleTurn(world);
      return;
    }

    face.replaceChildren(liftedPage.cloneNode(true));
    back.replaceChildren(landedPage.cloneNode(true));
    leaf.className = `page-leaf page-leaf--${forward ? 'forward' : 'back'}`;

    reader.classList.add('is-stacking');
    next.hidden = false;
    inflight = { current, next };
    current.classList.add('is-outgoing');
    next.classList.add('is-incoming', forward ? 'clip-right' : 'clip-left');
    reader.style.height = `${Math.max(current.offsetHeight, next.offsetHeight)}px`;

    requestAnimationFrame(() => {
      if (signal.aborted) return;
      reader.classList.add('is-turning');
      timers.push(setTimeout(() => {
        next.classList.remove('clip-right', 'clip-left');
        current.hidden = true;
        current.classList.remove('is-outgoing');
        inflight = null;
      }, TURN * 0.75));
      timers.push(setTimeout(() => {
        reader.classList.remove('is-turning', 'is-stacking');
        next.classList.remove('is-incoming');
        face.replaceChildren();
        back.replaceChildren();
        controller.settleTurn(world);
        reader.classList.add('is-resizing');
        reader.style.height = `${next.offsetHeight}px`;
        timers.push(setTimeout(() => {
          reader.classList.remove('is-resizing');
          reader.style.height = '';
        }, 280));
      }, TURN));
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('pointerenter', (event) => {
      const world = tabWorld(tab);
      if (event.pointerType === 'mouse' && canPreview.matches && world) {
        controller.schedulePreview(world);
      }
    }, { signal });
    tab.addEventListener('pointerleave', () => controller.clearPreview(), { signal });
    tab.addEventListener('focus', () => {
      const world = tabWorld(tab);
      if (canPreview.matches && tab.getAttribute('aria-selected') !== 'true' && world) {
        controller.schedulePreview(world);
      }
    }, { signal });
    tab.addEventListener('blur', () => controller.clearPreview(), { signal });
  });

  shelf.addEventListener('click', (event) => {
    const target = event.target;
    const tab = target instanceof Element
      ? target.closest<HTMLElement>('[role="tab"]')
      : null;
    if (tab?.dataset.book) open(tab.dataset.book, false);
  }, { signal });

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
  }, { signal });

  return settlePages;
}

function wireVisibility(
  root: HTMLElement,
  controller: LibraryStateController,
) {
  if (!('IntersectionObserver' in window)) return () => {};
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      if (entry.target === root) {
        controller.dispatch({ type: 'set-offscreen', value: !entry.isIntersecting });
      }
    });
  }, { rootMargin: '120px' });

  watcher.observe(root);
  root.querySelectorAll('[data-animated]').forEach((element) => watcher.observe(element));
  return () => watcher.disconnect();
}

function wireVisitorAwareness(
  root: HTMLElement,
  signal: AbortSignal,
) {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let bounds = root.getBoundingClientRect();
  let frame = 0;
  let x = 0;
  let y = 0;

  const enabled = () => fine.matches && !reduced.matches;
  const write = () => {
    frame = 0;
    root.style.setProperty('--visitor-x', x.toFixed(3));
    root.style.setProperty('--visitor-y', y.toFixed(3));
  };
  const queueWrite = () => {
    if (!frame) frame = requestAnimationFrame(write);
  };
  const reset = () => {
    x = 0;
    y = 0;
    queueWrite();
  };

  window.addEventListener('resize', () => {
    bounds = root.getBoundingClientRect();
  }, { passive: true, signal });
  root.addEventListener('pointermove', (event) => {
    if (!enabled() || event.pointerType !== 'mouse') return;
    x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
    y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    queueWrite();
  }, { passive: true, signal });
  root.addEventListener('pointerleave', reset, { signal });
  fine.addEventListener('change', reset, { signal });
  reduced.addEventListener('change', reset, { signal });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    root.style.removeProperty('--visitor-x');
    root.style.removeProperty('--visitor-y');
  };
}

function wireRareEvents(
  root: HTMLElement,
  controller: LibraryStateController,
  signal: AbortSignal,
) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: ReturnType<typeof setTimeout> | null = null;
  let active: RareEvent | null = null;
  let first = true;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const clearActive = () => {
    root.removeAttribute('data-rare-event');
    root.querySelector('[data-event-book="true"]')?.removeAttribute('data-event-book');
    active = null;
  };
  const mayRun = () => canRunAmbientEvent({
    reducedMotion: reduced.matches,
    offscreen: controller.current.offscreen,
    hidden: document.hidden,
    active: Boolean(active),
  });
  const schedule = () => {
    clearTimer();
    if (!mayRun()) return;
    const delay = first
      ? 32_000 + Math.random() * 28_000
      : 48_000 + Math.random() * 52_000;
    first = false;
    timer = setTimeout(run, delay);
  };
  const run = () => {
    timer = null;
    if (!mayRun()) return;
    const events = eligibleRareEvents(controller.current.committed);
    active = events[Math.floor(Math.random() * events.length)];
    if (active === 'book-nudge') {
      const books = Array.from(root.querySelectorAll<HTMLElement>('[data-book]'));
      books[Math.floor(Math.random() * books.length)]?.setAttribute('data-event-book', 'true');
    }
    root.dataset.rareEvent = active;
    timer = setTimeout(() => {
      clearActive();
      schedule();
    }, 2600);
  };
  const reconsider = () => {
    if (!mayRun()) {
      clearTimer();
      clearActive();
      return;
    }
    if (!timer) schedule();
  };

  document.addEventListener('visibilitychange', reconsider, { signal });
  root.addEventListener('library-state-change', reconsider, { signal });
  reduced.addEventListener('change', reconsider, { signal });
  schedule();

  return () => {
    clearTimer();
    clearActive();
  };
}

function setup() {
  window.__worksRoomCleanup?.();
  window.__worksRoomCleanup = undefined;

  const root = document.querySelector<HTMLElement>('.library');
  document.body.classList.toggle('works-room', Boolean(root));
  if (!root) return;

  const initialWorld = isLibraryWorld(root.dataset.world) ? root.dataset.world : 'valley';
  const aborter = new AbortController();
  const controller = new LibraryStateController(root, initialWorld);
  const cleanups = [
    wireShelfScroll(aborter.signal),
    wireShelf(controller, aborter.signal),
    wireVisibility(root, controller),
    wireVisitorAwareness(root, aborter.signal),
    wireRareEvents(root, controller, aborter.signal),
  ];

  window.__worksRoomCleanup = () => {
    aborter.abort();
    cleanups.forEach((cleanup) => cleanup());
    controller.destroy();
  };
}

if (!window.__worksRoom) {
  window.__worksRoom = true;
  document.addEventListener('astro:page-load', setup);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

export {};
