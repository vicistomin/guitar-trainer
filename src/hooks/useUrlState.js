import { useEffect, useCallback, useRef } from 'react';
import { buildPathFromState, getUrlStateFromPath } from '../utils/patternState';

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
  selectedVoicingId,
  setSelectedVoicingId,
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
    setSelectedVoicingId(nextState.selectedVoicingId);
    setRootNote(nextState.rootNote);
  }, [
    setInstrument,
    setTuning,
    setRootNote,
    setPatternType,
    setSelectedPattern,
    setSelectedVoicingId,
    patterns,
  ]);

  // Build clean URL path
  const buildPath = useCallback(() => {
    return buildPathFromState({
      patterns,
      instrument,
      tuning,
      rootNote,
      patternType,
      selectedPattern,
      selectedVoicingId,
    });
  }, [instrument, tuning, rootNote, patternType, selectedPattern, selectedVoicingId, patterns]);

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
