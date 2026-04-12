import { useMemo } from 'react';
import { generateFretboard } from '../../utils/fretboardUtils';
import { getInstrumentWithTuning } from '../../data/instruments';
import { isNoteInPattern, getInterval } from '../../utils/musicTheory';
import './Fretboard.css';

export function Fretboard({
  instrument = 'guitar',
  tuning: tuningId,
  rootNote,
  intervals,
  chordShape,
  chordShapes = [],
  onNoteClick,
  showNoteNames = true,
  showIntervals = false,
  highlightRoot = true,
}) {
  const instrumentConfig = getInstrumentWithTuning(instrument, tuningId);
  const { tuning, frets: numFrets, strings: numStrings, fretMarkers, doubleFretMarkers } = instrumentConfig;

  const fretboard = useMemo(() => generateFretboard(instrument, tuningId), [instrument, tuningId]);

  const handleNoteClick = (noteData) => {
    if (onNoteClick) {
      onNoteClick(noteData);
    }
  };

  const activeChordShapes = useMemo(
    () => (chordShapes.length > 0 ? chordShapes : chordShape ? [chordShape] : []),
    [chordShape, chordShapes],
  );
  const hasChordShapes = activeChordShapes.length > 0;

  const isNoteActive = (note, stringIndex, fretIndex) => {
    if (hasChordShapes) {
      return activeChordShapes.some((shape) => shape.frets[stringIndex] === fretIndex);
    }
    if (!rootNote || !intervals) return false;
    return isNoteInPattern(note, rootNote, intervals);
  };

  const getActiveShapesForPosition = (stringIndex, fretIndex) => {
    return activeChordShapes
      .filter((shape) => shape.frets[stringIndex] === fretIndex)
      .sort((left, right) => Number(left.isFocused) - Number(right.isFocused));
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

  // For chord shapes: determine string status (muted, open, or fretted)
  const getStringStatus = (stringIndex) => {
    if (!chordShape || activeChordShapes.length !== 1) return null;
    const fret = chordShape.frets[stringIndex];
    if (fret === null) return 'muted';
    if (fret === 0) return 'open';
    return 'fretted';
  };

  // Calculate barre positions for rendering
  const barreElements = useMemo(() => {
    return activeChordShapes.flatMap((shape) =>
      (shape.barres ?? []).map((barre, index) => ({
        ...barre,
        key: `${shape.id}-${index}`,
        colorToken: shape.colorToken,
        isFocused: shape.isFocused,
      })),
    );
  }, [activeChordShapes]);

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

        {/* Barre indicators */}
        {barreElements.map((barre) => {
          const topStringDisplay = numStrings - 1 - barre.toString;
          const bottomStringDisplay = numStrings - 1 - barre.fromString;
          const stringSpan = bottomStringDisplay - topStringDisplay;
          // Position relative to the fret area
          const fretPercent = ((barre.fret - 0.5) / numFrets) * 100;
          return (
            <div
              key={barre.key}
              className={`barre-indicator ${barre.colorToken ? `chord-voicing-${barre.colorToken}` : ''} ${barre.isFocused ? 'focused' : ''}`}
              style={{
                top: `calc(${30 + topStringDisplay * 28}px)`,
                height: `${stringSpan * 28}px`,
                left: `calc(${instrumentConfig.tuning ? 75 : 70}px + ${fretPercent}% - 4px)`,
              }}
            />
          );
        })}

        {/* Strings and frets - reversed so lowest string is at bottom */}
        <div className="strings-container">
          {[...fretboard].reverse().map((string, displayIndex) => {
            const stringIndex = numStrings - 1 - displayIndex;
            const stringStatus = getStringStatus(stringIndex);

            return (
              <div key={stringIndex} className="string-row">
                {/* Open string label */}
                <div className={`string-label ${stringStatus === 'muted' ? 'string-muted' : ''}`}>
                  {stringStatus === 'muted' ? 'X' : tuning[stringIndex]}
                </div>

                {/* Frets */}
                {string.map((fretData, fretIndex) => {
                  const active = isNoteActive(fretData.note, stringIndex, fretIndex);
                  const root = !hasChordShapes && isRoot(fretData.note);
                  const activeShapes = getActiveShapesForPosition(stringIndex, fretIndex);

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
                        hasChordShapes ? (
                          <div className={`note-indicator-stack ${activeShapes.length > 1 ? 'multi' : ''}`}>
                            {activeShapes.map((shape, shapeIndex) => {
                              const showLabel = activeChordShapes.length === 1 || shape.isFocused;

                              return (
                                <div
                                  key={shape.id}
                                  className={`note-indicator chord-voicing ${shape.colorToken ? `chord-voicing-${shape.colorToken}` : ''} ${shape.isFocused ? 'focused' : 'secondary'}`}
                                  title={`${shape.name} ${shape.label}: ${fretData.note}${fretData.octave}`}
                                  style={
                                    shape.isFocused
                                      ? undefined
                                      : { transform: `translate(${(shapeIndex + 1) * 6}px, ${-shapeIndex * 4}px)` }
                                  }
                                >
                                  {showLabel && (showNoteNames || showIntervals) && (
                                    <span className="note-text">{getDisplayText(fretData.note)}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            className={`note-indicator ${root && highlightRoot ? 'root' : ''}`}
                            title={`${fretData.note}${fretData.octave}`}
                          >
                            {(showNoteNames || showIntervals) && (
                              <span className="note-text">{getDisplayText(fretData.note)}</span>
                            )}
                          </div>
                        )
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
