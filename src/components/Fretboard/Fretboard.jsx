import { useMemo } from 'react';
import { generateFretboard, NUM_FRETS, NUM_STRINGS } from '../../utils/fretboardUtils';
// NUM_STRINGS used for reversing string display order
import { isNoteInPattern, getInterval, STANDARD_TUNING } from '../../utils/musicTheory';
import './Fretboard.css';

export function Fretboard({
  rootNote,
  intervals,
  onNoteClick,
  showNoteNames = true,
  showIntervals = false,
  highlightRoot = true,
}) {
  const fretboard = useMemo(() => generateFretboard(), []);

  // Fret markers (standard positions)
  const fretMarkers = [3, 5, 7, 9, 12, 15];
  const doubleFretMarkers = [12];

  const handleNoteClick = (noteData) => {
    if (onNoteClick) {
      onNoteClick(noteData);
    }
  };

  const isNoteActive = (note) => {
    if (!rootNote || !intervals) return false;
    return isNoteInPattern(note, rootNote, intervals);
  };

  const isRoot = (note) => {
    return note === rootNote;
  };

  const getDisplayText = (note) => {
    if (showIntervals && rootNote) {
      return getInterval(note, rootNote);
    }
    return note;
  };

  return (
    <div className="fretboard-container">
      <div className="fretboard">
        {/* Nut */}
        <div className="nut" />

        {/* Fret markers */}
        <div className="fret-markers">
          {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
            <div key={fret} className="fret-marker-slot">
              {fretMarkers.includes(fret) && (
                <div className={`fret-marker ${doubleFretMarkers.includes(fret) ? 'double' : ''}`}>
                  {doubleFretMarkers.includes(fret) && <div className="marker-dot" />}
                  <div className="marker-dot" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fret numbers */}
        <div className="fret-numbers">
          {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
            <div key={fret} className="fret-number">
              {fret}
            </div>
          ))}
        </div>

        {/* Strings and frets - reversed so low E is at bottom */}
        <div className="strings-container">
          {[...fretboard].reverse().map((string, displayIndex) => {
            const stringIndex = NUM_STRINGS - 1 - displayIndex; // Original string index for thickness
            return (
              <div key={stringIndex} className="string-row">
                {/* Open string label */}
                <div className="string-label">{STANDARD_TUNING[stringIndex]}</div>

                {/* Frets */}
                {string.map((fretData, fretIndex) => {
                  const active = isNoteActive(fretData.note);
                  const root = isRoot(fretData.note);

                  return (
                    <div
                      key={fretIndex}
                      className={`fret ${fretIndex === 0 ? 'open' : ''}`}
                      onClick={() => handleNoteClick(fretData)}
                    >
                      {/* String wire - thicker strings at bottom (low E) */}
                      <div
                        className="string-wire"
                        style={{
                          height: `${1 + (NUM_STRINGS - 1 - displayIndex) * 0.3}px`,
                        }}
                      />

                      {/* Note indicator */}
                      {active && (
                        <div
                          className={`note-indicator ${root && highlightRoot ? 'root' : ''}`}
                          title={`${fretData.note}${fretData.octave}`}
                        >
                          {(showNoteNames || showIntervals) && (
                            <span className="note-text">{getDisplayText(fretData.note)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Fret wires */}
        <div className="fret-wires">
          {Array.from({ length: NUM_FRETS }, (_, i) => (
            <div key={i} className="fret-wire" />
          ))}
        </div>
      </div>
    </div>
  );
}
