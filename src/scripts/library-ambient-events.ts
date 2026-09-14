type AmbientEvent = {
  id: string;
  run: (library: HTMLElement) => void;
  minGapMs: number;
};

const STORAGE_KEY = 'sw-library-ambient-last';

export function wireLibraryAmbientEvents(): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || library.dataset.ambientBound) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  library.dataset.ambientBound = '1';
  let running = false;
  let offscreen = false;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        offscreen = !entries[0]?.isIntersecting;
      },
      { threshold: 0.08 }
    );
    io.observe(library);
  }

  const events: AmbientEvent[] = [
    {
      id: 'owl-tilt',
      minGapMs: 45000,
      run: (root) => {
        root.querySelectorAll('.perch .owl, .perch svg').forEach((owl) => {
          owl.classList.add('ambient-owl-tilt');
          setTimeout(() => owl.classList.remove('ambient-owl-tilt'), 2200);
        });
      },
    },
    {
      id: 'leaf-fall',
      minGapMs: 55000,
      run: (root) => {
        const leaf = document.createElement('span');
        leaf.className = 'ambient-leaf-fall';
        leaf.setAttribute('aria-hidden', 'true');
        root.querySelector('.world-veil')?.appendChild(leaf);
        setTimeout(() => leaf.remove(), 8000);
      },
    },
    {
      id: 'lamp-flicker',
      minGapMs: 40000,
      run: (root) => {
        root.classList.add('ambient-lamp-flicker');
        setTimeout(() => root.classList.remove('ambient-lamp-flicker'), 900);
      },
    },
    {
      id: 'book-nudge',
      minGapMs: 70000,
      run: () => {
        const tab = document.querySelector<HTMLElement>('[data-shelf] [role="tab"][aria-selected="true"]');
        if (!tab) return;
        tab.classList.add('ambient-book-nudge');
        setTimeout(() => tab.classList.remove('ambient-book-nudge'), 1200);
      },
    },
  ];

  function schedule(): void {
    const delay = 28000 + Math.random() * 32000;
    window.setTimeout(tick, delay);
  }

  function tick(): void {
    if (running || offscreen || !document.querySelector('.library')) return;
    const event = events[Math.floor(Math.random() * events.length)];
    const lastRun = Number(sessionStorage.getItem(`${STORAGE_KEY}:${event.id}`) || 0);
    if (Date.now() - lastRun < event.minGapMs) {
      schedule();
      return;
    }
    running = true;
    event.run(library);
    sessionStorage.setItem(`${STORAGE_KEY}:${event.id}`, String(Date.now()));
    window.setTimeout(() => {
      running = false;
      schedule();
    }, 2500);
  }

  schedule();
}
