import {
  getNoteAtFret,
  getOctaveAtFret,
  isNoteInPattern,
  getFrequency
} from './musicTheory';
import { getInstrument, DEFAULT_INSTRUMENT } from '../data/instruments';

// Generate fretboard data structure for a given instrument
export function generateFretboard(instrumentId = DEFAULT_INSTRUMENT) {
  const instrument = getInstrument(instrumentId);
  const { tuning, tuningOctaves, frets, strings } = instrument;
  const fretboard = [];

  for (let string = 0; string < strings; string++) {
    const stringData = [];
    const openNote = tuning[string];
    const openOctave = tuningOctaves[string];

    for (let fret = 0; fret <= frets; fret++) {
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
  const numStrings = fretboard.length;
  const numFrets = fretboard[0]?.length - 1 || 0;

  for (let string = numStrings - 1; string >= 0; string--) {
    for (let fret = 0; fret <= numFrets; fret++) {
      if (fretboard[string][fret].note === rootNote) {
        return { string, fret };
      }
    }
  }
  return { string: 0, fret: 0 };
}

// Get suggested position range based on root note
export function getSuggestedRange(rootNote, fretboard) {
  const numFrets = fretboard[0]?.length - 1 || 0;
  const lowestRoot = findLowestRoot(rootNote, fretboard);
  const startFret = Math.max(0, lowestRoot.fret - 2);
  const endFret = Math.min(numFrets, lowestRoot.fret + 4);
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
