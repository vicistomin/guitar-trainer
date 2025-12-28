import { useState, useCallback, useMemo } from 'react';
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
import { getInstrument, DEFAULT_INSTRUMENT } from './data/instruments';
import { NOTES } from './utils/musicTheory';
import { generateFretboard, getPatternPositions, getUniqueNotesForPlayback } from './utils/fretboardUtils';

// Pattern collections for URL state
const patterns = { scales, pentatonics, arpeggios };

function App() {
  // Instrument selection
  const [instrument, setInstrument] = useState(DEFAULT_INSTRUMENT);

  // Pattern selection state
  const [patternType, setPatternType] = useState('scales');
  const [selectedPattern, setSelectedPattern] = useState(scales[0]);
  const [rootNote, setRootNote] = useState('C');

  // Display options
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showIntervals, setShowIntervals] = useState(false);

  // Playback state
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Generate fretboard data based on selected instrument
  const fretboard = useMemo(() => generateFretboard(instrument), [instrument]);
  const instrumentConfig = getInstrument(instrument);

  // Sync state with URL for shareable links
  useUrlState({
    instrument,
    setInstrument,
    rootNote,
    setRootNote,
    patternType,
    setPatternType,
    selectedPattern,
    setSelectedPattern,
    patterns,
  });

  // Handle note click
  const handleNoteClick = useCallback((noteData) => {
    playNote(noteData.frequency, 0.5);
    if (isSessionActive && selectedPattern) {
      trackPattern(selectedPattern.name, rootNote);
    }
  }, [playNote, isSessionActive, selectedPattern, rootNote, trackPattern]);

  // Play pattern sequence
  const handlePlayPattern = useCallback(() => {
    if (!selectedPattern) return;

    const positions = getPatternPositions(rootNote, selectedPattern.intervals, fretboard);
    const playableNotes = getUniqueNotesForPlayback(positions, true);

    if (playableNotes.length > 0) {
      setIsPlaying(true);
      playSequence(playableNotes, bpm);

      // Stop playing after sequence finishes
      const duration = (playableNotes.length * 60 / bpm) * 1000;
      setTimeout(() => {
        setIsPlaying(false);
      }, duration);

      if (isSessionActive) {
        trackPattern(selectedPattern.name, rootNote);
      }
    }
  }, [selectedPattern, rootNote, fretboard, bpm, playSequence, isSessionActive, trackPattern]);

  // Stop playback
  const handleStopPattern = useCallback(() => {
    stopAll();
    setIsPlaying(false);
  }, [stopAll]);

  // Randomize pattern and key
  const handleRandomize = useCallback(() => {
    // Get all patterns
    const allPatterns = [...scales, ...pentatonics, ...arpeggios];
    const randomPattern = allPatterns[Math.floor(Math.random() * allPatterns.length)];
    const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];

    // Determine pattern type
    if (scales.includes(randomPattern)) {
      setPatternType('scales');
    } else if (pentatonics.includes(randomPattern)) {
      setPatternType('pentatonics');
    } else {
      setPatternType('arpeggios');
    }

    setSelectedPattern(randomPattern);
    setRootNote(randomNote);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{instrumentConfig.name} Trainer</h1>
        <p>Practice scales, arpeggios, and pentatonics</p>
      </header>

      <main className="app-main">
        <div className="main-content">
          {/* Current pattern display */}
          <div className="current-pattern-display">
            <span className="pattern-key">{rootNote}</span>
            <span className="pattern-name">{selectedPattern?.name || 'Select a pattern'}</span>
          </div>

          {/* Fretboard */}
          <Fretboard
            instrument={instrument}
            rootNote={rootNote}
            intervals={selectedPattern?.intervals}
            onNoteClick={handleNoteClick}
            showNoteNames={showNoteNames}
            showIntervals={showIntervals}
          />

          {/* Controls */}
          <Controls
            instrument={instrument}
            setInstrument={setInstrument}
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
          />

          {/* Pattern Selector */}
          <PatternSelector
            patternType={patternType}
            setPatternType={setPatternType}
            selectedPattern={selectedPattern}
            setSelectedPattern={setSelectedPattern}
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
