import { chords, getChordById, getChordVoicings, getChordsForInstrument } from '../data/chords';
import { DEFAULT_INSTRUMENT, instruments } from '../data/instruments';

export const BASE_PATH = '/guitar-trainer';
export const DEFAULT_PATTERN_TYPE = 'scales';
export const DEFAULT_ROOT_NOTE = 'C';

const VALID_TYPES = ['scales', 'pentatonics', 'arpeggios', 'chords'];
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function noteToSlug(note) {
  return note.toLowerCase().replace('#', '-sharp');
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

function getCanonicalChordsForInstrument(instrumentId, tuningId) {
  return chords.filter((chord) => getChordVoicings(chord.id, instrumentId, tuningId).length > 0);
}

function resolveSelectedChordId(selectedPattern) {
  if (!selectedPattern) {
    return null;
  }

  if (selectedPattern.canonicalId) {
    return selectedPattern.canonicalId;
  }

  return selectedPattern.id ?? null;
}

function resolveSelectedVoicingId(selectedPattern, selectedVoicingId) {
  if (selectedVoicingId) {
    return selectedVoicingId;
  }

  if (selectedPattern?.canonicalId) {
    return selectedPattern.id;
  }

  return null;
}

function findChordBySegment(instrumentId, tuningId, chordSegment) {
  if (!chordSegment) {
    return null;
  }

  const availableChords = getCanonicalChordsForInstrument(instrumentId, tuningId);
  const canonicalMatch = availableChords.find(
    (chord) => chord.id === chordSegment || toSlug(chord.name) === chordSegment,
  );

  if (canonicalMatch) {
    return canonicalMatch;
  }

  const legacyShape = getChordsForInstrument(instrumentId, tuningId).find(
    (chord) => chord.id === chordSegment || toSlug(chord.name) === chordSegment,
  );

  return legacyShape?.canonicalId ? getChordById(legacyShape.canonicalId) ?? null : null;
}

function normalizeChordSelection({ patterns, selectedPattern, selectedVoicingId, instrument, tuning }) {
  const availablePatterns = getCanonicalChordsForInstrument(instrument, tuning);

  if (availablePatterns.length === 0) {
    const fallbackPatterns = patterns[DEFAULT_PATTERN_TYPE] ?? [];

    return {
      patternType: DEFAULT_PATTERN_TYPE,
      selectedPattern: fallbackPatterns[0],
      selectedVoicingId: undefined,
    };
  }

  const requestedChordId = resolveSelectedChordId(selectedPattern);
  const normalizedPattern =
    availablePatterns.find((pattern) => pattern.id === requestedChordId) ?? availablePatterns[0];
  const availableVoicings = getChordVoicings(normalizedPattern.id, instrument, tuning);
  const requestedVoicingId = resolveSelectedVoicingId(selectedPattern, selectedVoicingId);
  const normalizedVoicingId =
    availableVoicings.find((voicing) => voicing.id === requestedVoicingId)?.id ??
    availableVoicings[0]?.id;

  return {
    patternType: 'chords',
    selectedPattern: normalizedPattern,
    selectedVoicingId: normalizedVoicingId,
  };
}

export function getPatternsForType(patterns, patternType, instrument, tuning) {
  if (patternType === 'chords') {
    return getCanonicalChordsForInstrument(instrument, tuning);
  }

  return patterns[patternType] ?? patterns[DEFAULT_PATTERN_TYPE];
}

export function normalizePatternSelection({
  patterns,
  patternType,
  selectedPattern,
  selectedVoicingId,
  instrument,
  tuning,
}) {
  let normalizedType = VALID_TYPES.includes(patternType) ? patternType : DEFAULT_PATTERN_TYPE;

  if (normalizedType === 'chords') {
    return normalizeChordSelection({
      patterns,
      selectedPattern,
      selectedVoicingId,
      instrument,
      tuning,
    });
  }

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
    selectedVoicingId: undefined,
  };
}

export function buildPathFromState({
  patterns,
  instrument,
  tuning,
  rootNote,
  patternType,
  selectedPattern,
  selectedVoicingId,
}) {
  const normalizedState = normalizePatternSelection({
    patterns,
    patternType,
    selectedPattern,
    selectedVoicingId,
    instrument,
    tuning,
  });
  const instrumentConfig = instruments[instrument];
  const isDefaultTuning = !instrumentConfig || tuning === instrumentConfig.defaultTuning;
  const tuningSegment = isDefaultTuning ? '' : `/${tuning}`;

  if (normalizedState.patternType === 'chords') {
    const voicings = getChordVoicings(normalizedState.selectedPattern.id, instrument, tuning);
    const voicingSegment =
      voicings.length > 1 && normalizedState.selectedVoicingId
        ? `/${normalizedState.selectedVoicingId}`
        : '';

    return `${BASE_PATH}/${instrument}${tuningSegment}/chords/${normalizedState.selectedPattern.id}${voicingSegment}`;
  }

  const patternSlug = normalizedState.selectedPattern
    ? toSlug(normalizedState.selectedPattern.name)
    : toSlug(patterns[DEFAULT_PATTERN_TYPE][0].name);
  const noteSlug = noteToSlug(rootNote ?? DEFAULT_ROOT_NOTE);

  return `${BASE_PATH}/${instrument}${tuningSegment}/${normalizedState.patternType}/${patternSlug}/${noteSlug}`;
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
        selectedVoicingId: undefined,
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

  if (requestedType === 'chords') {
    const requestedChord = findChordBySegment(normalizedInstrument, tuning, remainingSegments[1]);

    return {
      instrument: normalizedInstrument,
      tuning,
      rootNote: DEFAULT_ROOT_NOTE,
      ...normalizePatternSelection({
        patterns,
        patternType: 'chords',
        selectedPattern: requestedChord,
        selectedVoicingId: remainingSegments[2] ?? undefined,
        instrument: normalizedInstrument,
        tuning,
      }),
    };
  }

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
      selectedVoicingId: undefined,
      instrument: normalizedInstrument,
      tuning,
    }),
  };
}
