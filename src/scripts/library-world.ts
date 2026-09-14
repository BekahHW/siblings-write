/** Optional hover preview only — committed world is set from works-room when a book opens. */
export function wireLibraryWorld(): void {
  const library = document.querySelector<HTMLElement>('.library');
  const shelf = document.querySelector<HTMLElement>('[data-shelf]');
  if (!library || !shelf || shelf.dataset.worldBound) return;
  shelf.dataset.worldBound = '1';

  let previewTimer = 0;

  function committedWorld(): string {
    return library!.dataset.worldCommitted || library!.getAttribute('data-world') || 'valley';
  }

  function clearPreview(): void {
    window.clearTimeout(previewTimer);
    library!.classList.remove('is-previewing');
    library!.setAttribute('data-world', committedWorld());
  }

  function worldFromTab(tab: Element | null): string | null {
    return tab?.getAttribute('data-world') ?? null;
  }

  shelf.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (library!.classList.contains('is-turning-book')) return;
    const world = worldFromTab((event.target as Element).closest('[role="tab"]'));
    if (!world || world === committedWorld()) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      if (library!.classList.contains('is-turning-book')) return;
      library!.setAttribute('data-world', world);
      library!.classList.add('is-previewing');
    }, 220);
  });

  shelf.addEventListener('pointerleave', () => {
    clearPreview();
  });

  shelf.addEventListener('focusin', () => {
    clearPreview();
  });
}

export function commitLibraryWorld(world: string): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || !world) return;
  library.dataset.worldCommitted = world;
  library.setAttribute('data-world', world);
  library.classList.remove('is-previewing');
}
