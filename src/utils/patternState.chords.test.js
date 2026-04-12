import { describe, expect, test } from 'vitest';
import { arpeggios } from '../data/arpeggios';
import { getChordById, getChordsForInstrument } from '../data/chords';
import { pentatonics } from '../data/pentatonics';
import { scales } from '../data/scales';
import { buildPathFromState, getUrlStateFromPath, normalizePatternSelection } from './patternState';

const patterns = {
  scales,
  pentatonics,
  arpeggios,
};

describe('patternState chord helpers', () => {
  test('normalizes a legacy chord shape into a canonical chord plus focused voicing', () => {
    const shellVoicing = getChordsForInstrument('guitar', 'standard').find(
      (chord) => chord.id === 'cmaj7-guitar-standard-shell',
    );

    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: shellVoicing,
      selectedVoicingId: undefined,
      instrument: 'guitar',
      tuning: 'standard',
    });

    expect(normalized.patternType).toBe('chords');
    expect(normalized.selectedPattern.id).toBe('cmaj7');
    expect(normalized.selectedVoicingId).toBe('cmaj7-guitar-standard-shell');
  });

  test('keeps the same canonical chord when a new tuning has a matching voicing', () => {
    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: getChordById('cmaj7'),
      selectedVoicingId: 'cmaj7-guitar-standard-shell',
      instrument: 'guitar',
      tuning: 'dropd',
    });

    expect(normalized.patternType).toBe('chords');
    expect(normalized.selectedPattern.id).toBe('cmaj7');
    expect(normalized.selectedVoicingId).toBe('cmaj7-guitar-dropd-drone');
  });

  test('falls back to the first valid voicing when the requested voicing id is invalid', () => {
    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: getChordById('cmaj7'),
      selectedVoicingId: 'not-a-voicing',
      instrument: 'guitar',
      tuning: 'standard',
    });

    expect(normalized.selectedPattern.id).toBe('cmaj7');
    expect(normalized.selectedVoicingId).toBe('cmaj7-guitar-standard-open');
  });

  test('falls back to the first valid canonical chord when the requested chord is invalid', () => {
    const normalized = normalizePatternSelection({
      patterns,
      patternType: 'chords',
      selectedPattern: { id: 'missing', type: 'chord' },
      selectedVoicingId: 'missing-voicing',
      instrument: 'guitar',
      tuning: 'openg',
    });

    expect(normalized.patternType).toBe('chords');
    expect(normalized.selectedPattern.id).toBe('g13');
    expect(normalized.selectedVoicingId).toBe('g13-guitar-openg-slide');
  });

  test('parses chord URLs with canonical chord ids and focused voicing ids', () => {
    const nextState = getUrlStateFromPath(
      '/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-shell',
      patterns,
    );

    expect(nextState.instrument).toBe('guitar');
    expect(nextState.tuning).toBe('standard');
    expect(nextState.patternType).toBe('chords');
    expect(nextState.selectedPattern.id).toBe('cmaj7');
    expect(nextState.selectedVoicingId).toBe('cmaj7-guitar-standard-shell');
    expect(nextState.rootNote).toBe('C');
  });

  test('builds chord URLs without a root note and omits voicing when only one is available', () => {
    const standardPath = buildPathFromState({
      patterns,
      instrument: 'guitar',
      tuning: 'standard',
      rootNote: 'F#',
      patternType: 'chords',
      selectedPattern: getChordById('cmaj7'),
      selectedVoicingId: 'cmaj7-guitar-standard-shell',
    });
    const openGPath = buildPathFromState({
      patterns,
      instrument: 'guitar',
      tuning: 'openg',
      rootNote: 'A',
      patternType: 'chords',
      selectedPattern: getChordById('g13'),
      selectedVoicingId: 'g13-guitar-openg-slide',
    });

    expect(standardPath).toBe('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-shell');
    expect(openGPath).toBe('/guitar-trainer/guitar/openg/chords/g13');
  });
});
