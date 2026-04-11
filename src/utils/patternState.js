import { getChordsForInstrument } from '../data/chords';
import { DEFAULT_INSTRUMENT, instruments } from '../data/instruments';

export const BASE_PATH = '/guitar-trainer';
export const DEFAULT_PATTERN_TYPE = 'scales';
export const DEFAULT_ROOT_NOTE = 'C';

const VALID_TYPES = ['scales', 'pentatonics', 'arpeggios', 'chords'];
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function slugToNote(slug) {
  const note = slug.replace('-sharp', '#').toUpperCase();
  return VALID_NOTES.includes(note) ? note : null;
}

function findPatternBySlug(patternsArray, slug) {
  return patternsArray.find((pattern) => toSlug(pattern.name) === slug);
}

function isValidTuning(instrumentId, tuningId) {
  return Boolean(instruments[instrumentId]?.tunings?.[tuningId]);
}

export function getPatternsForType(patterns, patternType, instrument, tuning) {
  if (patternType === 'chords') {
    return getChordsForInstrument(instrument, tuning);
  }

  return patterns[patternType] ?? patterns[DEFAULT_PATTERN_TYPE];
}

export function normalizePatternSelection({
  patterns,
  patternType,
  selectedPattern,
  instrument,
  tuning,
}) {
  let normalizedType = VALID_TYPES.includes(patternType) ? patternType : DEFAULT_PATTERN_TYPE;
  let availablePatterns = getPatternsForType(patterns, normalizedType, instrument, tuning);

  if (availablePatterns.length === 0) {
    normalizedType = DEFAULT_PATTERN_TYPE;
    availablePatterns = getPatternsForType(patterns, normalizedType, instrument, tuning);
  }

  const normalizedPattern =
    availablePatterns.find((pattern) => pattern.id === selectedPattern?.id) ??
    availablePatterns[0] ??
    patterns[DEFAULT_PATTERN_TYPE][0];

  return {
    patternType: normalizedType,
    selectedPattern: normalizedPattern,
  };
}

export function getUrlStateFromPath(pathname, patterns) {
  const defaultTuning = instruments[DEFAULT_INSTRUMENT].defaultTuning;
  const relativePath = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  const segments = relativePath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return {
      instrument: DEFAULT_INSTRUMENT,
      tuning: defaultTuning,
      rootNote: DEFAULT_ROOT_NOTE,
      ...normalizePatternSelection({
        patterns,
        patternType: DEFAULT_PATTERN_TYPE,
        selectedPattern: patterns[DEFAULT_PATTERN_TYPE][0],
        instrument: DEFAULT_INSTRUMENT,
        tuning: defaultTuning,
      }),
    };
  }

  const [instrumentSegment, ...rest] = segments;
  const normalizedInstrument = instruments[instrumentSegment] ? instrumentSegment : DEFAULT_INSTRUMENT;

  let tuning = instruments[normalizedInstrument].defaultTuning;
  let remainingSegments = rest;

  if (rest.length > 0 && isValidTuning(normalizedInstrument, rest[0])) {
    tuning = rest[0];
    remainingSegments = rest.slice(1);
  }

  let requestedType = VALID_TYPES.includes(remainingSegments[0]) ? remainingSegments[0] : DEFAULT_PATTERN_TYPE;
  let availablePatterns = getPatternsForType(patterns, requestedType, normalizedInstrument, tuning);

  if (availablePatterns.length === 0) {
    requestedType = DEFAULT_PATTERN_TYPE;
    availablePatterns = getPatternsForType(patterns, requestedType, normalizedInstrument, tuning);
  }

  const requestedPattern = remainingSegments[1]
    ? findPatternBySlug(availablePatterns, remainingSegments[1]) ?? null
    : null;
  const rootNote = remainingSegments[2]
    ? slugToNote(remainingSegments[2]) ?? DEFAULT_ROOT_NOTE
    : DEFAULT_ROOT_NOTE;

  return {
    instrument: normalizedInstrument,
    tuning,
    rootNote,
    ...normalizePatternSelection({
      patterns,
      patternType: requestedType,
      selectedPattern: requestedPattern,
      instrument: normalizedInstrument,
      tuning,
    }),
  };
}
