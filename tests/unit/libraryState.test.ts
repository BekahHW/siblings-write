import { describe, expect, it } from 'vitest';
import {
  canRunAmbientEvent,
  eligibleRareEvents,
  initialLibraryState,
  libraryPhase,
  reduceLibraryState,
  visibleLibraryWorld,
} from '../../src/scripts/library-state';

describe('library world state', () => {
  it('previews without changing the committed world', () => {
    const state = reduceLibraryState(initialLibraryState('valley'), {
      type: 'preview',
      world: 'island',
    });

    expect(state.committed).toBe('valley');
    expect(visibleLibraryWorld(state)).toBe('island');
    expect(libraryPhase(state)).toBe('preview');
  });

  it('freezes the visible world while replacing rapid pending turns', () => {
    const preview = reduceLibraryState(initialLibraryState('valley'), {
      type: 'preview',
      world: 'christmas',
    });
    const firstTurn = reduceLibraryState(preview, {
      type: 'begin-turn',
      world: 'island',
    });
    const rapidTurn = reduceLibraryState(firstTurn, {
      type: 'begin-turn',
      world: 'sandbridge',
    });

    expect(visibleLibraryWorld(firstTurn)).toBe('christmas');
    expect(visibleLibraryWorld(rapidTurn)).toBe('christmas');
    expect(rapidTurn.pendingCommit).toBe('sandbridge');
    expect(libraryPhase(rapidTurn)).toBe('turning');

    const settled = reduceLibraryState(rapidTurn, { type: 'settle-turn' });
    expect(visibleLibraryWorld(settled)).toBe('sandbridge');
    expect(settled.committed).toBe('sandbridge');
  });

  it('blocks previews offscreen and identifies the offscreen phase', () => {
    const offscreen = reduceLibraryState(initialLibraryState('valley'), {
      type: 'set-offscreen',
      value: true,
    });
    const attemptedPreview = reduceLibraryState(offscreen, {
      type: 'preview',
      world: 'island',
    });

    expect(attemptedPreview.preview).toBeNull();
    expect(libraryPhase(attemptedPreview)).toBe('offscreen');
  });
});

describe('rare ambient event guards', () => {
  it('allows only eligible world-specific events', () => {
    expect(eligibleRareEvents('valley')).toContain('paw');
    expect(eligibleRareEvents('valley')).not.toContain('tentacle');
    expect(eligibleRareEvents('sandbridge')).toContain('tentacle');
    expect(eligibleRareEvents('island')).toContain('creature');
  });

  it.each([
    { reducedMotion: true, offscreen: false, hidden: false, active: false },
    { reducedMotion: false, offscreen: true, hidden: false, active: false },
    { reducedMotion: false, offscreen: false, hidden: true, active: false },
    { reducedMotion: false, offscreen: false, hidden: false, active: true },
  ])('suspends when any guard is active: %o', (options) => {
    expect(canRunAmbientEvent(options)).toBe(false);
  });
});
