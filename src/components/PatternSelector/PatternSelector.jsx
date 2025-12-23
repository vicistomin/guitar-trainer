import { scales, scaleCategories } from '../../data/scales';
import { pentatonics, pentatonicCategories } from '../../data/pentatonics';
import { arpeggios, arpeggioCategories } from '../../data/arpeggios';
import './PatternSelector.css';

const PATTERN_TYPES = [
  { id: 'scales', name: 'Scales', data: scales, categories: scaleCategories },
  { id: 'pentatonics', name: 'Pentatonics', data: pentatonics, categories: pentatonicCategories },
  { id: 'arpeggios', name: 'Arpeggios', data: arpeggios, categories: arpeggioCategories },
];

export function PatternSelector({
  patternType,
  setPatternType,
  selectedPattern,
  setSelectedPattern,
}) {
  const currentType = PATTERN_TYPES.find((t) => t.id === patternType) || PATTERN_TYPES[0];

  const handleTypeChange = (typeId) => {
    setPatternType(typeId);
    const type = PATTERN_TYPES.find((t) => t.id === typeId);
    if (type && type.data.length > 0) {
      setSelectedPattern(type.data[0]);
    }
  };

  const handlePatternChange = (patternId) => {
    const pattern = currentType.data.find((p) => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
    }
  };

  return (
    <div className="pattern-selector">
      {/* Pattern type tabs */}
      <div className="pattern-tabs">
        {PATTERN_TYPES.map((type) => (
          <button
            key={type.id}
            className={`pattern-tab ${patternType === type.id ? 'active' : ''}`}
            onClick={() => handleTypeChange(type.id)}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Pattern list */}
      <div className="pattern-list">
        {currentType.categories.map((category) => (
          <div key={category} className="pattern-category">
            <h4 className="category-title">{category}</h4>
            <div className="pattern-items">
              {currentType.data
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
          <p className="pattern-intervals">
            Intervals: {selectedPattern.intervals.join(' - ')}
          </p>
        </div>
      )}
    </div>
  );
}
