import { useEffect, useCallback, useRef } from 'react';
import { instruments } from '../data/instruments';

// Base path from vite config
const BASE_PATH = '/guitar-trainer';

// Valid values
const VALID_INSTRUMENTS = ['guitar', 'ukulele', 'mandolin', 'violin'];
const VALID_TYPES = ['scales', 'pentatonics', 'arpeggios', 'chords'];
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert pattern name to URL slug: "Minor Pentatonic" -> "minor-pentatonic"
function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Convert note to URL-safe format: "C#" -> "c-sharp"
function noteToSlug(note) {
  return note.toLowerCase().replace('#', '-sharp');
}

// Convert URL slug back to note: "c-sharp" -> "C#"
function slugToNote(slug) {
  const note = slug.replace('-sharp', '#').toUpperCase();
  return VALID_NOTES.includes(note) ? note : null;
}

// Find pattern by slug in a patterns array
function findPatternBySlug(patternsArray, slug) {
  return patternsArray.find(p => toSlug(p.name) === slug);
}

// Check if a string is a valid tuning ID for an instrument
function isValidTuning(instrumentId, tuningId) {
  const instrument = instruments[instrumentId];
  return instrument && instrument.tunings && tuningId in instrument.tunings;
}

/**
 * Hook to sync app state with clean URL paths
 * URL format: /guitar-trainer/{instrument}/{tuning?}/{type}/{pattern}/{note}
 * Tuning segment is optional (omitted when using default tuning)
 * Example: /guitar-trainer/guitar/dadgad/scales/major/c
 * Example: /guitar-trainer/ukulele/scales/major/c-sharp (default tuning omitted)
 */
export function useUrlState({
  instrument,
  setInstrument,
  tuning,
  setTuning,
  rootNote,
  setRootNote,
  patternType,
  setPatternType,
  selectedPattern,
  setSelectedPattern,
  patterns, // { scales, pentatonics, arpeggios }
}) {
  const isInitialized = useRef(false);

  // Parse URL path and set initial state
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const path = window.location.pathname;
    // Remove base path and split into segments
    const relativePath = path.startsWith(BASE_PATH)
      ? path.slice(BASE_PATH.length)
      : path;
    const segments = relativePath.split('/').filter(Boolean);

    if (segments.length === 0) return;

    const [urlInstrument, ...rest] = segments;

    // Set instrument
    if (!urlInstrument || !VALID_INSTRUMENTS.includes(urlInstrument)) return;
    setInstrument(urlInstrument);

    // Check if second segment is a tuning ID for this instrument
    let remainingSegments = rest;
    if (rest.length > 0 && isValidTuning(urlInstrument, rest[0])) {
      setTuning(rest[0]);
      remainingSegments = rest.slice(1);
    }

    const [urlType, urlPattern, urlNote] = remainingSegments;

    // Set pattern type and pattern
    if (urlType && VALID_TYPES.includes(urlType)) {
      setPatternType(urlType);

      if (urlPattern && patterns[urlType]) {
        const matchedPattern = findPatternBySlug(patterns[urlType], urlPattern);
        if (matchedPattern) {
          setSelectedPattern(matchedPattern);
        }
      }
    }

    // Set root note
    if (urlNote) {
      const note = slugToNote(urlNote);
      if (note) {
        setRootNote(note);
      }
    }
  }, [setInstrument, setTuning, setRootNote, setPatternType, setSelectedPattern, patterns]);

  // Build clean URL path
  const buildPath = useCallback(() => {
    const patternSlug = selectedPattern ? toSlug(selectedPattern.name) : 'major';
    const noteSlug = noteToSlug(rootNote);

    // Only include tuning in URL when it differs from default
    const instrumentConfig = instruments[instrument];
    const isDefaultTuning = !instrumentConfig || tuning === instrumentConfig.defaultTuning;
    const tuningSegment = isDefaultTuning ? '' : `/${tuning}`;

    return `${BASE_PATH}/${instrument}${tuningSegment}/${patternType}/${patternSlug}/${noteSlug}`;
  }, [instrument, tuning, patternType, selectedPattern, rootNote]);

  // Update URL when state changes
  useEffect(() => {
    if (!isInitialized.current) return;

    const timeoutId = setTimeout(() => {
      const newPath = buildPath();
      if (window.location.pathname !== newPath) {
        window.history.replaceState({}, '', newPath);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [buildPath]);

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
    return `${window.location.origin}${buildPath()}`;
  }, [buildPath]);

  return { getShareableUrl };
}
