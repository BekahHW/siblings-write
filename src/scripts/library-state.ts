export const libraryWorlds = ['valley', 'christmas', 'island', 'sandbridge'] as const;

export type LibraryWorld = (typeof libraryWorlds)[number];
export type LibraryPhase = 'committed' | 'preview' | 'turning' | 'offscreen';

export interface LibraryState {
  committed: LibraryWorld;
  preview: LibraryWorld | null;
  pendingCommit: LibraryWorld | null;
  frozenWorld: LibraryWorld;
  turning: boolean;
  offscreen: boolean;
}

export type LibraryAction =
  | { type: 'preview'; world: LibraryWorld }
  | { type: 'clear-preview' }
  | { type: 'begin-turn'; world: LibraryWorld }
  | { type: 'settle-turn'; world?: LibraryWorld }
  | { type: 'set-offscreen'; value: boolean };

export function isLibraryWorld(value: string | undefined): value is LibraryWorld {
  return libraryWorlds.includes(value as LibraryWorld);
}

export function initialLibraryState(world: LibraryWorld): LibraryState {
  return {
    committed: world,
    preview: null,
    pendingCommit: null,
    frozenWorld: world,
    turning: false,
    offscreen: false,
  };
}

export function reduceLibraryState(
  state: LibraryState,
  action: LibraryAction,
): LibraryState {
  switch (action.type) {
    case 'preview':
      if (state.turning || state.offscreen || action.world === state.committed) return state;
      return { ...state, preview: action.world };
    case 'clear-preview':
      return state.preview ? { ...state, preview: null } : state;
    case 'begin-turn':
      return {
        ...state,
        preview: null,
        pendingCommit: action.world,
        frozenWorld: state.turning ? state.frozenWorld : visibleLibraryWorld(state),
        turning: true,
      };
    case 'settle-turn': {
      const committed = action.world ?? state.pendingCommit ?? state.committed;
      return {
        ...state,
        committed,
        preview: null,
        pendingCommit: null,
        frozenWorld: committed,
        turning: false,
      };
    }
    case 'set-offscreen':
      return {
        ...state,
        offscreen: action.value,
        preview: action.value ? null : state.preview,
      };
  }
}

export function visibleLibraryWorld(state: LibraryState): LibraryWorld {
  if (state.turning) return state.frozenWorld;
  return state.preview ?? state.committed;
}

export function libraryPhase(state: LibraryState): LibraryPhase {
  if (state.offscreen) return 'offscreen';
  if (state.turning) return 'turning';
  if (state.preview) return 'preview';
  return 'committed';
}

export const commonRareEvents = [
  'owl-tilt',
  'falling-leaf',
  'light-flicker',
  'book-nudge',
  'distant-shadow',
] as const;

export type RareEvent =
  | (typeof commonRareEvents)[number]
  | 'creature'
  | 'paw'
  | 'tentacle';

export function eligibleRareEvents(world: LibraryWorld): RareEvent[] {
  const events: RareEvent[] = [...commonRareEvents];
  if (world === 'valley') events.push('paw');
  if (world === 'island') events.push('creature');
  if (world === 'sandbridge') events.push('tentacle');
  return events;
}

export function canRunAmbientEvent(options: {
  reducedMotion: boolean;
  offscreen: boolean;
  hidden: boolean;
  active: boolean;
}): boolean {
  return !options.reducedMotion
    && !options.offscreen
    && !options.hidden
    && !options.active;
}
