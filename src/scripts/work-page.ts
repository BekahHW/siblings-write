import { markWorkVisited } from './library-memory';

let disposeCurrentPage: (() => void) | undefined;

function initializeWorkPage() {
  disposeCurrentPage?.();

  const page = document.querySelector<HTMLElement>('[data-work-page]');
  if (!page) {
    disposeCurrentPage = undefined;
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;
  const workId = page.dataset.workId;
  if (workId) markWorkVisited(workId);

  const atmosphereObserver = new IntersectionObserver(
    ([entry]) => {
      page.dataset.atmosphereActive = String(entry?.isIntersecting ?? false);
    },
    { rootMargin: '100px' },
  );
  atmosphereObserver.observe(page);

  const hero = page.querySelector<HTMLElement>('.work-hero');
  const trailerObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) return;
    const iframe = page.querySelector<HTMLIFrameElement>('[data-trailer-player] iframe');
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
      'https://www.youtube-nocookie.com',
    );
  });
  if (hero) trailerObserver.observe(hero);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (!reducedMotion.matches && finePointer.matches) {
    let frame = 0;
    page.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - .5) * 10;
        const y = (event.clientY / window.innerHeight - .5) * 8;
        page.style.setProperty('--work-parallax-x', `${x}px`);
        page.style.setProperty('--work-parallax-y', `${y}px`);
        page.style.setProperty('--hero-x', `${x * -.22}px`);
        page.style.setProperty('--hero-y', `${y * -.22}px`);
      });
    }, { passive: true, signal });

    page.addEventListener('pointerleave', () => {
      page.style.removeProperty('--work-parallax-x');
      page.style.removeProperty('--work-parallax-y');
      page.style.removeProperty('--hero-x');
      page.style.removeProperty('--hero-y');
    }, { signal });
  }

  page.querySelector<HTMLButtonElement>('[data-play-trailer]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const trailerId = button.dataset.trailerId;
    const player = page.querySelector<HTMLElement>('[data-trailer-player]');
    if (!trailerId || !player || player.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailerId)}?autoplay=1&controls=1&enablejsapi=1&rel=0&modestbranding=1`;
    iframe.title = player.dataset.title ?? 'Book trailer';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    player.append(iframe);
    player.hidden = false;
    page.querySelector<HTMLElement>('.work-hero-content')?.setAttribute('hidden', '');
    iframe.focus();
  }, { signal });

  disposeCurrentPage = () => {
    controller.abort();
    atmosphereObserver.disconnect();
    trailerObserver.disconnect();
    page.querySelector<HTMLIFrameElement>('[data-trailer-player] iframe')?.remove();
  };
}

document.addEventListener('astro:page-load', initializeWorkPage);
document.addEventListener('astro:before-swap', () => disposeCurrentPage?.());
initializeWorkPage();
