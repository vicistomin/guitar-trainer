import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Fretboard } from './components/Fretboard/Fretboard';
import { Controls } from './components/Controls/Controls';
import { PatternSelector } from './components/PatternSelector/PatternSelector';
import { ProgressTracker } from './components/ProgressTracker/ProgressTracker';
import { useAudio } from './hooks/useAudio';
import { useProgress } from './hooks/useProgress';
import { useUrlState } from './hooks/useUrlState';
import { scales } from './data/scales';
import { pentatonics } from './data/pentatonics';
import { arpeggios } from './data/arpeggios';
import { chords, getChordById, getChordVoicings, getChordsForInstrument } from './data/chords';
import { getInstrumentWithTuning, DEFAULT_INSTRUMENT, instruments } from './data/instruments';
import { NOTES } from './utils/musicTheory';
import { generateFretboard, getPatternPositions, getUniqueNotesForPlayback } from './utils/fretboardUtils';
import { normalizePatternSelection } from './utils/patternState';

// Pattern collections for URL state
const patterns = { scales, pentatonics, arpeggios, chords };

function App() {
  // Instrument selection
  const [instrument, setInstrument] = useState(DEFAULT_INSTRUMENT);
  const [tuning, setTuning] = useState('standard');

  // Pattern selection state
  const [patternType, setPatternType] = useState('scales');
  const [selectedPattern, setSelectedPattern] = useState(scales[0]);
  const [selectedVoicingId, setSelectedVoicingId] = useState(undefined);
  const [rootNote, setRootNote] = useState('C');

  // Display options
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showIntervals, setShowIntervals] = useState(false);

  // Playback state
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutRef = useRef(null);

  // Hooks
  const { playNote, playSequence, stopAll } = useAudio();
  const {
    isSessionActive,
    sessionStart,
    currentSessionPatterns,
    startSession,
    endSession,
    trackPattern,
    getStats,
    formatTime,
    resetProgress,
    autoStartEnabled,
    toggleAutoStart,
  } = useProgress();

  // Reset tuning when instrument actually changes (not on initial mount)
  const prevInstrument = useRef(instrument);
  useEffect(() => {
    if (prevInstrument.current === instrument) return;
    prevInstrument.current = instrument;
    const instrumentConfig = instruments[instrument];
    if (instrumentConfig) {
      setTuning(instrumentConfig.defaultTuning);
    }
  }, [instrument]);

  useEffect(() => {
    const normalizedState = normalizePatternSelection({
      patterns,
      patternType,
      selectedPattern,
      selectedVoicingId,
      instrument,
      tuning,
    });

    if (normalizedState.patternType !== patternType) {
      setPatternType(normalizedState.patternType);
    }

    if (normalizedState.selectedPattern?.id !== selectedPattern?.id) {
      setSelectedPattern(normalizedState.selectedPattern);
    }

    if (normalizedState.selectedVoicingId !== selectedVoicingId) {
      setSelectedVoicingId(normalizedState.selectedVoicingId);
    }
  }, [instrument, tuning, patternType, selectedPattern, selectedVoicingId]);

  // Generate fretboard data based on selected instrument and tuning
  const fretboard = useMemo(() => generateFretboard(instrument, tuning), [instrument, tuning]);
  const instrumentConfig = getInstrumentWithTuning(instrument, tuning);

  // Check if current pattern is a chord shape
  const isChordMode = selectedPattern?.type === 'chord';
  const focusedChordVoicing = useMemo(() => {
    if (!isChordMode || !selectedPattern) {
      return null;
    }

    const availableVoicings = getChordVoicings(selectedPattern.id, instrument, tuning);

    return (
      availableVoicings.find((voicing) => voicing.id === selectedVoicingId) ??
      availableVoicings[0] ??
      null
    );
  }, [instrument, isChordMode, selectedPattern, selectedVoicingId, tuning]);
  const selectedChordShape = useMemo(() => {
    if (!isChordMode) {
      return undefined;
    }

    return getChordsForInstrument(instrument, tuning).find((chord) => chord.id === focusedChordVoicing?.id);
  }, [focusedChordVoicing?.id, instrument, isChordMode, tuning]);

  const handleSelectedPatternChange = useCallback((nextPattern) => {
    if (nextPattern?.type === 'chord' && nextPattern.canonicalId) {
      const canonicalChord = getChordById(nextPattern.canonicalId);

      if (canonicalChord) {
        setSelectedPattern(canonicalChord);
        setSelectedVoicingId(nextPattern.id);
        return;
      }
    }

    setSelectedPattern(nextPattern);
    setSelectedVoicingId(undefined);
  }, []);

  // Sync state with URL for shareable links
  useUrlState({
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
    patterns,
  });

  // Handle note click
  const handleNoteClick = useCallback((noteData) => {
    playNote(noteData.frequency, 0.5);
    if (isSessionActive && selectedPattern) {
      trackPattern(selectedPattern.name, selectedPattern.type === 'chord' ? undefined : rootNote);
    }
  }, [playNote, isSessionActive, selectedPattern, rootNote, trackPattern]);

  // Play pattern sequence
  const handlePlayPattern = useCallback(() => {
    if (!selectedPattern) return;

    let playableNotes;

    if (selectedPattern.type === 'chord') {
      if (!selectedChordShape) return;

      // For chords: extract notes from specific fret positions
      playableNotes = selectedChordShape.frets
        .map((fret, stringIndex) => fret !== null ? fretboard[stringIndex][fret] : null)
        .filter(Boolean)
        .sort((a, b) => a.frequency - b.frequency);
    } else {
      const positions = getPatternPositions(rootNote, selectedPattern.intervals, fretboard);
      playableNotes = getUniqueNotesForPlayback(positions, true);
    }

    if (playableNotes.length > 0) {
      if (playbackTimeoutRef.current !== null) {
        clearTimeout(playbackTimeoutRef.current);
      }
      setIsPlaying(true);
      playSequence(playableNotes, bpm);

      // Stop playing after sequence finishes
      const duration = (playableNotes.length * 60 / bpm) * 1000;
      playbackTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playbackTimeoutRef.current = null;
      }, duration);

      if (isSessionActive) {
        trackPattern(selectedPattern.name, selectedPattern.type === 'chord' ? undefined : rootNote);
      }
    }
  }, [
    selectedChordShape,
    selectedPattern,
    rootNote,
    fretboard,
    bpm,
    playSequence,
    isSessionActive,
    trackPattern,
  ]);

  // Stop playback
  const handleStopPattern = useCallback(() => {
    if (playbackTimeoutRef.current !== null) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    stopAll();
    setIsPlaying(false);
  }, [stopAll]);

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current !== null) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  // Randomize pattern and key
  const handleRandomize = useCallback(() => {
    // Get all interval-based patterns
    const allPatterns = [...scales, ...pentatonics, ...arpeggios];

    // Include chords if available for current instrument
    const instrumentChords = getChordsForInstrument(instrument, tuning);
    if (instrumentChords.length > 0) {
      allPatterns.push(...instrumentChords);
    }

    const randomPattern = allPatterns[Math.floor(Math.random() * allPatterns.length)];
    const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];

    // Determine pattern type
    if (randomPattern.type === 'chord') {
      setPatternType('chords');
      setSelectedPattern(getChordById(randomPattern.canonicalId) ?? randomPattern);
      setSelectedVoicingId(randomPattern.id);
    } else if (scales.includes(randomPattern)) {
      setPatternType('scales');
      setSelectedPattern(randomPattern);
      setSelectedVoicingId(undefined);
    } else if (pentatonics.includes(randomPattern)) {
      setPatternType('pentatonics');
      setSelectedPattern(randomPattern);
      setSelectedVoicingId(undefined);
    } else {
      setPatternType('arpeggios');
      setSelectedPattern(randomPattern);
      setSelectedVoicingId(undefined);
    }
    setRootNote(randomNote);
  }, [instrument, tuning]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{instrumentConfig.name} Trainer</h1>
        <p>Practice scales, arpeggios, pentatonics{isChordMode ? '' : ' & chords'}</p>
      </header>

      <main className="app-main">
        <div className="main-content">
          {/* Current pattern display */}
          <div className="current-pattern-display">
            {!isChordMode && <span className="pattern-key">{rootNote}</span>}
            <span className="pattern-name">{selectedPattern?.name || 'Select a pattern'}</span>
          </div>

          {/* Fretboard */}
          <Fretboard
            instrument={instrument}
            tuning={tuning}
            rootNote={isChordMode ? undefined : rootNote}
            intervals={!isChordMode ? selectedPattern?.intervals : undefined}
            chordShape={selectedChordShape}
            onNoteClick={handleNoteClick}
            showNoteNames={showNoteNames || isChordMode}
            showIntervals={!isChordMode && showIntervals}
            highlightRoot={!isChordMode}
          />

          {/* Controls */}
          <Controls
            instrument={instrument}
            setInstrument={setInstrument}
            tuning={tuning}
            setTuning={setTuning}
            rootNote={rootNote}
            setRootNote={setRootNote}
            bpm={bpm}
            setBpm={setBpm}
            showNoteNames={showNoteNames}
            setShowNoteNames={setShowNoteNames}
            showIntervals={showIntervals}
            setShowIntervals={setShowIntervals}
            onPlayPattern={handlePlayPattern}
            onStopPattern={handleStopPattern}
            onRandomize={handleRandomize}
            isPlaying={isPlaying}
            isChordMode={isChordMode}
          />

          {/* Pattern Selector */}
          <PatternSelector
            patternType={patternType}
            setPatternType={setPatternType}
            selectedPattern={selectedPattern}
            setSelectedPattern={handleSelectedPatternChange}
            selectedChordVoicing={focusedChordVoicing}
            instrument={instrument}
            tuning={tuning}
          />
        </div>

        {/* Sidebar with progress */}
        <aside className="sidebar">
          <ProgressTracker
            isSessionActive={isSessionActive}
            sessionStart={sessionStart}
            currentSessionPatterns={currentSessionPatterns}
            onStartSession={startSession}
            onEndSession={endSession}
            getStats={getStats}
            formatTime={formatTime}
            onResetProgress={resetProgress}
            autoStartEnabled={autoStartEnabled}
            onToggleAutoStart={toggleAutoStart}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
