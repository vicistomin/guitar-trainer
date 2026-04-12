import './ChordVoicingNavigator.css';

export function ChordVoicingNavigator({
  voicings,
  selectedVoicingId,
  onSelectVoicing,
  isDesktop,
}) {
  if (voicings.length <= 1) {
    return null;
  }

  const currentIndex = Math.max(
    voicings.findIndex((voicing) => voicing.id === selectedVoicingId),
    0,
  );

  if (!isDesktop) {
    return (
      <div className="chord-voicing-navigator chord-voicing-navigator-mobile">
        <button
          type="button"
          className="voicing-nav-button"
          aria-label="Previous Position"
          disabled={currentIndex === 0}
          onClick={() => onSelectVoicing(voicings[currentIndex - 1].id)}
        >
          Prev
        </button>
        <span className="voicing-progress">
          {currentIndex + 1} of {voicings.length}
        </span>
        <button
          type="button"
          className="voicing-nav-button"
          aria-label="Next Position"
          disabled={currentIndex === voicings.length - 1}
          onClick={() => onSelectVoicing(voicings[currentIndex + 1].id)}
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div className="chord-voicing-navigator chord-voicing-navigator-desktop">
      {voicings.map((voicing) => (
        <button
          key={voicing.id}
          type="button"
          className={`voicing-chip ${selectedVoicingId === voicing.id ? 'active' : ''} voicing-chip-${voicing.colorToken}`}
          onClick={() => onSelectVoicing(voicing.id)}
        >
          {voicing.label}
        </button>
      ))}
    </div>
  );
}
