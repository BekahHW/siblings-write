import { hasSeenTreeSecret, markTreeSecretSeen } from '../lib/library/storage';

type ArchiveEntry = { title: string; text: string };

export function wireLibraryTreeSecret(): void {
  const library = document.querySelector<HTMLElement>('.library');
  const trigger = document.querySelector<HTMLButtonElement>('[data-tree-secret]');
  const panel = document.querySelector<HTMLElement>('[data-tree-secret-panel]');
  if (!library || !trigger || !panel || trigger.dataset.secretBound) return;
  trigger.dataset.secretBound = '1';

  let entries: ArchiveEntry[] = [];
  try {
    entries = JSON.parse(library.dataset.archiveSecrets || '[]');
  } catch {
    entries = [];
  }

  function render(): void {
    panel.innerHTML = entries
      .map(
        (entry) =>
          `<p class="tree-archive-entry"><strong>${entry.title}</strong><br />${entry.text}</p>`
      )
      .join('');
  }

  function openPanel(): void {
    render();
    panel.hidden = false;
    library!.classList.add('tree-secret-open');
    markTreeSecretSeen();
    trigger!.setAttribute('aria-expanded', 'true');
  }

  function closePanel(): void {
    panel.hidden = true;
    library!.classList.remove('tree-secret-open');
    trigger!.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  if (hasSeenTreeSecret()) {
    trigger.classList.add('is-remembered');
  }
}
