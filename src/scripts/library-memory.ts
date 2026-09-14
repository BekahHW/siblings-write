import { getVisitedWorkIds, hasVisitedAnyWork } from '../lib/library/storage';

export function wireLibraryMemory(): void {
  const library = document.querySelector<HTMLElement>('.library');
  if (!library || library.dataset.memoryBound) return;
  library.dataset.memoryBound = '1';

  const visited = new Set(getVisitedWorkIds());
  document.querySelectorAll<HTMLElement>('[data-shelf] [role="tab"]').forEach((tab) => {
    const id = tab.dataset.book;
    if (id && visited.has(id)) tab.classList.add('is-visited');
  });

  const welcome = document.querySelector<HTMLElement>('[data-welcome-back]');
  if (welcome && hasVisitedAnyWork()) {
    welcome.hidden = false;
  }

}
