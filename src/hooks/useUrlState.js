import { useEffect, useCallback, useRef } from 'react';
import { instruments } from '../data/instruments';
import { BASE_PATH, getUrlStateFromPath } from '../utils/patternState';

// Convert pattern name to URL slug: "Minor Pentatonic" -> "minor-pentatonic"
function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Convert note to URL-safe format: "C#" -> "c-sharp"
function noteToSlug(note) {
  return note.toLowerCase().replace('#', '-sharp');
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

    const nextState = getUrlStateFromPath(window.location.pathname, patterns);

    setInstrument(nextState.instrument);
    setTuning(nextState.tuning);
    setPatternType(nextState.patternType);
    setSelectedPattern(nextState.selectedPattern);
    setRootNote(nextState.rootNote);
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
