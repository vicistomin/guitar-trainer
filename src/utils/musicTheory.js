// All 12 notes in chromatic order
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents for display
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
export const STANDARD_TUNING_OCTAVES = [2, 2, 3, 3, 3, 4];

// Base frequency for A4 = 440Hz
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

// Get the index of a note (0-11)
export function getNoteIndex(note) {
  const normalized = note.replace('b', '#');
  // Handle flats
  if (note.includes('b')) {
    const baseNote = note[0];
    const baseIndex = NOTES.indexOf(baseNote);
    return (baseIndex - 1 + 12) % 12;
  }
  return NOTES.indexOf(normalized);
}

// Get note name from index
export function getNoteName(index, useFlats = false) {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return useFlats ? FLAT_NOTES[normalizedIndex] : NOTES[normalizedIndex];
}

// Transpose a note by semitones
export function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  return getNoteName(index + semitones);
}

// Calculate frequency for a note
export function getFrequency(note, octave) {
  const noteIndex = getNoteIndex(note);
  // MIDI note number calculation
  const midiNote = (octave + 1) * 12 + noteIndex;
  // Frequency calculation: f = 440 * 2^((n-69)/12)
  return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI) / 12);
}

// Get note at a specific fret on a string
export function getNoteAtFret(stringNote, fret) {
  const stringIndex = getNoteIndex(stringNote);
  return getNoteName(stringIndex + fret);
}

// Get octave at a specific fret on a string
export function getOctaveAtFret(stringOctave, stringNote, fret) {
  const stringIndex = getNoteIndex(stringNote);
  const newIndex = stringIndex + fret;
  const octaveIncrease = Math.floor(newIndex / 12);
  return stringOctave + octaveIncrease;
}

// Check if a note is in a scale/pattern
export function isNoteInPattern(note, rootNote, intervals) {
  const noteIndex = getNoteIndex(note);
  const rootIndex = getNoteIndex(rootNote);
  const relativeIndex = ((noteIndex - rootIndex) % 12 + 12) % 12;
  return intervals.includes(relativeIndex);
}

// Get interval name
export function getIntervalName(semitones) {
  const intervalNames = {
    0: 'R',    // Root
    1: 'm2',   // Minor 2nd
    2: '2',    // Major 2nd
    3: 'm3',   // Minor 3rd
    4: '3',    // Major 3rd
    5: '4',    // Perfect 4th
    6: 'b5',   // Tritone
    7: '5',    // Perfect 5th
    8: '#5',   // Augmented 5th
    9: '6',    // Major 6th
    10: 'b7',  // Minor 7th
    11: '7',   // Major 7th
  };
  return intervalNames[semitones % 12] || '';
}

// Get the interval of a note relative to a root
export function getInterval(note, rootNote) {
  const noteIndex = getNoteIndex(note);
  const rootIndex = getNoteIndex(rootNote);
  const interval = ((noteIndex - rootIndex) % 12 + 12) % 12;
  return getIntervalName(interval);
}
