import {
  STANDARD_TUNING,
  STANDARD_TUNING_OCTAVES,
  getNoteAtFret,
  getOctaveAtFret,
  getNoteIndex,
  isNoteInPattern,
  getFrequency
} from './musicTheory';

// Number of frets to display
export const NUM_FRETS = 15;
export const NUM_STRINGS = 6;

// Generate fretboard data structure
export function generateFretboard() {
  const fretboard = [];

  for (let string = 0; string < NUM_STRINGS; string++) {
    const stringData = [];
    const openNote = STANDARD_TUNING[string];
    const openOctave = STANDARD_TUNING_OCTAVES[string];

    for (let fret = 0; fret <= NUM_FRETS; fret++) {
      const note = getNoteAtFret(openNote, fret);
      const octave = getOctaveAtFret(openOctave, openNote, fret);
      const frequency = getFrequency(note, octave);

      stringData.push({
        string,
        fret,
        note,
        octave,
        frequency,
      });
    }
    fretboard.push(stringData);
  }

  return fretboard;
}

// Get all positions of a pattern on the fretboard
export function getPatternPositions(rootNote, intervals, fretboard) {
  const positions = [];

  for (let string = 0; string < fretboard.length; string++) {
    for (let fret = 0; fret < fretboard[string].length; fret++) {
      const fretData = fretboard[string][fret];
      if (isNoteInPattern(fretData.note, rootNote, intervals)) {
        const isRoot = fretData.note === rootNote;
        positions.push({
          ...fretData,
          isRoot,
        });
      }
    }
  }

  return positions;
}

// Get positions within a specific fret range (for CAGED positions)
export function getPatternInRange(rootNote, intervals, fretboard, startFret, endFret) {
  return getPatternPositions(rootNote, intervals, fretboard).filter(
    pos => pos.fret >= startFret && pos.fret <= endFret
  );
}

// Find the lowest root note position on the fretboard
export function findLowestRoot(rootNote, fretboard) {
  for (let string = NUM_STRINGS - 1; string >= 0; string--) {
    for (let fret = 0; fret <= NUM_FRETS; fret++) {
      if (fretboard[string][fret].note === rootNote) {
        return { string, fret };
      }
    }
  }
  return { string: 0, fret: 0 };
}

// Get suggested position range based on root note
export function getSuggestedRange(rootNote, fretboard) {
  const lowestRoot = findLowestRoot(rootNote, fretboard);
  const startFret = Math.max(0, lowestRoot.fret - 2);
  const endFret = Math.min(NUM_FRETS, lowestRoot.fret + 4);
  return { startFret, endFret };
}

// Sort positions for sequential playback (low to high)
export function sortPositionsForPlayback(positions) {
  return [...positions].sort((a, b) => {
    // Sort by frequency (pitch) ascending
    return a.frequency - b.frequency;
  });
}

// Get unique notes from positions (for arpeggio playback)
export function getUniqueNotesForPlayback(positions, oneOctave = true) {
  const sorted = sortPositionsForPlayback(positions);

  if (!oneOctave) {
    return sorted;
  }

  // Get one octave worth of notes
  const uniqueNotes = [];
  const seenNotes = new Set();

  for (const pos of sorted) {
    if (!seenNotes.has(pos.note)) {
      seenNotes.add(pos.note);
      uniqueNotes.push(pos);
    }
    // Stop after we've collected all unique notes in the pattern
    if (uniqueNotes.length >= 8) break;
  }

  return uniqueNotes;
}
