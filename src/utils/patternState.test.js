import { describe, expect, test } from 'vitest';
import { arpeggios } from '../data/arpeggios';
import { chords } from '../data/chords';
import { pentatonics } from '../data/pentatonics';
import { scales } from '../data/scales';
import { getUrlStateFromPath, normalizePatternSelection } from './patternState';

const patterns = {
  scales,
  pentatonics,
  arpeggios,
  chords,
};

describe('patternState helpers', () => {
  test('falls back to Major Scale when a selected chord is unavailable for the tuning', () => {
    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: chords[0],
      instrument: 'guitar',
      tuning: 'dadgad',
    });

    expect(normalized.patternType).toBe('scales');
    expect(normalized.selectedPattern.id).toBe('major');
  });

  test('restores invalid chord URLs to a valid scale selection', () => {
    const nextState = getUrlStateFromPath('/guitar-trainer/ukulele/chords/not-a-pattern/c', patterns);

    expect(nextState.instrument).toBe('ukulele');
    expect(nextState.tuning).toBe('standard');
    expect(nextState.patternType).toBe('scales');
    expect(nextState.selectedPattern.id).toBe('major');
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
