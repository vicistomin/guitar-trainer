import { describe, expect, test } from 'vitest';
import { arpeggios } from '../data/arpeggios';
import { getChordById } from '../data/chords';
import { pentatonics } from '../data/pentatonics';
import { scales } from '../data/scales';
import { getUrlStateFromPath, normalizePatternSelection } from './patternState';

const patterns = {
  scales,
  pentatonics,
  arpeggios,
};

describe('patternState helpers', () => {
  test('falls back to the first valid chord when the selected chord is unavailable for the tuning', () => {
    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: getChordById('c'),
      selectedVoicingId: 'c-guitar-standard-open',
      instrument: 'guitar',
      tuning: 'dadgad',
    });

    expect(normalized.patternType).toBe('chords');
    expect(normalized.selectedPattern.id).toBe('d9');
    expect(normalized.selectedVoicingId).toBe('d9-guitar-dadgad-drone');
  });

  test('restores invalid chord URLs to the first valid chord for the current instrument', () => {
    const nextState = getUrlStateFromPath('/guitar-trainer/ukulele/chords/not-a-pattern/c', patterns);

    expect(nextState.instrument).toBe('ukulele');
    expect(nextState.tuning).toBe('standard');
    expect(nextState.patternType).toBe('chords');
    expect(nextState.selectedPattern.id).toBe('c');
    expect(nextState.selectedVoicingId).toBe('c-ukulele-standard-open');
    expect(nextState.rootNote).toBe('C');
  });

  test('keeps valid non-chord URL selections intact', () => {
    const nextState = getUrlStateFromPath('/guitar-trainer/guitar/dadgad/pentatonics/blues-scale/f-sharp', patterns);

    expect(nextState.instrument).toBe('guitar');
    expect(nextState.tuning).toBe('dadgad');
    expect(nextState.patternType).toBe('pentatonics');
    expect(nextState.selectedPattern.id).toBe('blues-scale');
    expect(nextState.rootNote).toBe('F#');
  });
});
