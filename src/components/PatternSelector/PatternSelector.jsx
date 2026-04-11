import { useMemo } from 'react';
import { scales, scaleCategories } from '../../data/scales';
import { pentatonics, pentatonicCategories } from '../../data/pentatonics';
import { arpeggios, arpeggioCategories } from '../../data/arpeggios';
import { chords, chordCategories, getChordsForInstrument } from '../../data/chords';
import './PatternSelector.css';

const PATTERN_TYPES = [
  { id: 'scales', name: 'Scales', data: scales, categories: scaleCategories },
  { id: 'pentatonics', name: 'Pentatonics', data: pentatonics, categories: pentatonicCategories },
  { id: 'arpeggios', name: 'Arpeggios', data: arpeggios, categories: arpeggioCategories },
  { id: 'chords', name: 'Chords', data: chords, categories: chordCategories },
];

export function PatternSelector({
  patternType,
  setPatternType,
  selectedPattern,
  setSelectedPattern,
  instrument,
  tuning,
}) {
  const currentType = PATTERN_TYPES.find((t) => t.id === patternType) || PATTERN_TYPES[0];

  // Filter chords by instrument/tuning
  const filteredData = useMemo(() => {
    if (currentType.id === 'chords' && instrument && tuning) {
      return getChordsForInstrument(instrument, tuning);
    }
    return currentType.data;
  }, [currentType, instrument, tuning]);

  // Get categories that have data
  const activeCategories = useMemo(() => {
    return currentType.categories.filter(cat =>
      filteredData.some(p => p.category === cat)
    );
  }, [currentType.categories, filteredData]);

  // Check if chords are available for current instrument
  const chordsAvailable = useMemo(() => {
    if (!instrument || !tuning) return false;
    return getChordsForInstrument(instrument, tuning).length > 0;
  }, [instrument, tuning]);

  const handleTypeChange = (typeId) => {
    setPatternType(typeId);
    const type = PATTERN_TYPES.find((t) => t.id === typeId);
    if (type) {
      if (typeId === 'chords') {
        const instrumentChords = getChordsForInstrument(instrument, tuning);
        if (instrumentChords.length > 0) {
          setSelectedPattern(instrumentChords[0]);
        }
      } else if (type.data.length > 0) {
        setSelectedPattern(type.data[0]);
      }
    }
  };

  const handlePatternChange = (patternId) => {
    const pattern = filteredData.find((p) => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
    }
  };

  return (
    <div className="pattern-selector">
      {/* Pattern type tabs */}
      <div className="pattern-tabs">
        {PATTERN_TYPES.map((type) => {
          // Hide chords tab when no chords available for current instrument
          if (type.id === 'chords' && !chordsAvailable) return null;
          return (
            <button
              key={type.id}
              className={`pattern-tab ${patternType === type.id ? 'active' : ''}`}
              onClick={() => handleTypeChange(type.id)}
            >
              {type.name}
            </button>
          );
        })}
      </div>

      {/* Pattern list */}
      <div className="pattern-list">
        {activeCategories.map((category) => (
          <div key={category} className="pattern-category">
            <h4 className="category-title">{category}</h4>
            <div className="pattern-items">
              {filteredData
                .filter((p) => p.category === category)
                .map((pattern) => (
                  <button
                    key={pattern.id}
                    className={`pattern-item ${selectedPattern?.id === pattern.id ? 'active' : ''}`}
                    onClick={() => handlePatternChange(pattern.id)}
                    title={pattern.description}
                  >
                    {pattern.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected pattern info */}
      {selectedPattern && (
        <div className="pattern-info">
          <h3>{selectedPattern.name}</h3>
          <p className="pattern-description">{selectedPattern.description}</p>
          {selectedPattern.type === 'chord' ? (
            <p className="pattern-intervals">
              Frets: {selectedPattern.frets.map(f => f === null ? 'X' : f).join(' - ')}
            </p>
          ) : (
            <p className="pattern-intervals">
              Intervals: {selectedPattern.intervals.join(' - ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
