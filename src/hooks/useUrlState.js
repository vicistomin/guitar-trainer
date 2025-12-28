import { useEffect, useCallback, useRef } from 'react';

// Base path from vite config
const BASE_PATH = '/guitar-trainer';

// Valid values
const VALID_INSTRUMENTS = ['guitar', 'ukulele'];
const VALID_TYPES = ['scales', 'pentatonics', 'arpeggios'];
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

/**
 * Hook to sync app state with clean URL paths
 * URL format: /guitar-trainer/{instrument}/{type}/{pattern}/{note}
 * Example: /guitar-trainer/ukulele/scales/major/c-sharp
 */
export function useUrlState({
  instrument,
  setInstrument,
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

    // Parse: /{instrument}/{type}/{pattern}/{note}
    const [urlInstrument, urlType, urlPattern, urlNote] = segments;

    // Set instrument
    if (urlInstrument && VALID_INSTRUMENTS.includes(urlInstrument)) {
      setInstrument(urlInstrument);
    }

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
  }, [setInstrument, setRootNote, setPatternType, setSelectedPattern, patterns]);

  // Build clean URL path
  const buildPath = useCallback(() => {
    const patternSlug = selectedPattern ? toSlug(selectedPattern.name) : 'major';
    const noteSlug = noteToSlug(rootNote);

    return `${BASE_PATH}/${instrument}/${patternType}/${patternSlug}/${noteSlug}`;
  }, [instrument, patternType, selectedPattern, rootNote]);

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
