/** Fine-pointer parallax via CSS variables — no layout reads in the move loop. */
export function wireLibraryParallax(): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || library.dataset.parallaxBound) return;

  const finePointer = window.matchMedia('(pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reduced.matches) return;

  library.dataset.parallaxBound = '1';
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = 0;

  function tick(): void {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    library!.style.setProperty('--parallax-x', currentX.toFixed(3));
    library!.style.setProperty('--parallax-y', currentY.toFixed(3));
    raf = requestAnimationFrame(tick);
  }

  library.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = library!.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = nx * 6;
      targetY = ny * 4;
    },
    { passive: true }
  );

  library.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
  });

  raf = requestAnimationFrame(tick);

  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelAnimationFrame(raf);
      library.style.removeProperty('--parallax-x');
      library.style.removeProperty('--parallax-y');
    }
  });
}
