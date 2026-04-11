import { describe, expect, test } from 'vitest';
import { getUniqueNotesForPlayback, sortPositionsForPlayback } from './fretboardUtils';

const positions = [
  { note: 'G', frequency: 196 },
  { note: 'C', frequency: 130.81 },
  { note: 'E', frequency: 164.81 },
  { note: 'C', frequency: 261.63 },
  { note: 'G', frequency: 392.0 },
];

describe('fretboardUtils playback helpers', () => {
  test('sortPositionsForPlayback orders positions from low to high pitch', () => {
    expect(sortPositionsForPlayback(positions).map((position) => position.frequency)).toEqual([
      130.81,
      164.81,
      196,
      261.63,
      392,
    ]);
  });

  test('getUniqueNotesForPlayback keeps the first occurrence of each pitch class in pitch order', () => {
    expect(getUniqueNotesForPlayback(positions, true).map((position) => position.note)).toEqual([
      'C',
      'E',
      'G',
    ]);
  });

  test('getUniqueNotesForPlayback can return all sorted positions when octave collapsing is disabled', () => {
    expect(getUniqueNotesForPlayback(positions, false)).toEqual(sortPositionsForPlayback(positions));
  });
});
