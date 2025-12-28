import { useMemo } from 'react';
import { generateFretboard } from '../../utils/fretboardUtils';
import { getInstrument } from '../../data/instruments';
import { isNoteInPattern, getInterval } from '../../utils/musicTheory';
import './Fretboard.css';

export function Fretboard({
  instrument = 'guitar',
  rootNote,
  intervals,
  onNoteClick,
  showNoteNames = true,
  showIntervals = false,
  highlightRoot = true,
}) {
  const instrumentConfig = getInstrument(instrument);
  const { tuning, frets: numFrets, strings: numStrings, fretMarkers, doubleFretMarkers } = instrumentConfig;

  const fretboard = useMemo(() => generateFretboard(instrument), [instrument]);

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
      <div className={`fretboard fretboard-${instrument}`}>
        {/* Nut */}
        <div className="nut" />

        {/* Fret markers */}
        <div className="fret-markers">
          {Array.from({ length: numFrets }, (_, i) => i + 1).map((fret) => (
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
          {Array.from({ length: numFrets }, (_, i) => i + 1).map((fret) => (
            <div key={fret} className="fret-number">
              {fret}
            </div>
          ))}
        </div>

        {/* Strings and frets - reversed so lowest string is at bottom */}
        <div className="strings-container">
          {[...fretboard].reverse().map((string, displayIndex) => {
            const stringIndex = numStrings - 1 - displayIndex;
            return (
              <div key={stringIndex} className="string-row">
                {/* Open string label */}
                <div className="string-label">{tuning[stringIndex]}</div>

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
                      {/* String wire - thicker strings at bottom */}
                      <div
                        className="string-wire"
                        style={{
                          height: `${1 + (numStrings - 1 - displayIndex) * 0.4}px`,
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
          {Array.from({ length: numFrets }, (_, i) => (
            <div key={i} className="fret-wire" />
          ))}
        </div>
      </div>
    </div>
  );
}
