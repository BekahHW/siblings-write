/** Preview and commit story-world atmosphere on the main library element. */
export function wireLibraryWorld(): void {
  const library = document.querySelector<HTMLElement>('.library');
  const shelf = document.querySelector<HTMLElement>('[data-shelf]');
  if (!library || !shelf || shelf.dataset.worldBound) return;
  shelf.dataset.worldBound = '1';

  let committed = library.getAttribute('data-world') || 'valley';
  let preview: string | null = null;

  function applyWorld(): void {
    const world = preview ?? committed;
    library!.setAttribute('data-world', world);
    library!.classList.toggle(
      'is-previewing',
      preview !== null && preview !== committed
    );
  }

  function worldFromTab(tab: Element | null): string | null {
    return tab?.getAttribute('data-world') ?? null;
  }

  shelf.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    const world = worldFromTab((event.target as Element).closest('[role="tab"]'));
    if (!world) return;
    preview = world;
    applyWorld();
  });

  shelf.addEventListener('pointerleave', () => {
    preview = null;
    applyWorld();
  });

  shelf.addEventListener('focusin', (event) => {
    const world = worldFromTab((event.target as Element).closest('[role="tab"]'));
    if (!world) return;
    preview = world;
    applyWorld();
  });

  shelf.addEventListener('focusout', (event) => {
    if (!shelf.contains(event.relatedTarget as Node)) {
      preview = null;
      applyWorld();
    }
  });

  shelf.addEventListener('click', (event) => {
    const world = worldFromTab((event.target as Element).closest('[role="tab"]'));
    if (!world) return;
    committed = world;
    preview = null;
    applyWorld();
  });
}

export function commitLibraryWorld(world: string): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || !world) return;
  library.setAttribute('data-world', world);
  library.classList.remove('is-previewing');
}
