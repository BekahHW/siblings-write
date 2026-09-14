export function wireLibraryDeparture(): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || library.dataset.departureBound) return;
  library.dataset.departureBound = '1';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll<HTMLAnchorElement>('[data-read-more]').forEach((link) => {
    if (link.dataset.departureBound) return;
    link.dataset.departureBound = '1';
    link.addEventListener('click', () => {
      if (reduced.matches) return;
      library.classList.add('is-departing');
      const world = link.dataset.readWorld;
      if (world) library.setAttribute('data-world', world);
    });
  });
}
