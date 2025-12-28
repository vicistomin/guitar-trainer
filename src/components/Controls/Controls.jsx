import { NOTES } from '../../utils/musicTheory';
import { getInstrumentList } from '../../data/instruments';
import './Controls.css';

export function Controls({
  instrument,
  setInstrument,
  rootNote,
  setRootNote,
  bpm,
  setBpm,
  showNoteNames,
  setShowNoteNames,
  showIntervals,
  setShowIntervals,
  onPlayPattern,
  onStopPattern,
  onRandomize,
  isPlaying,
}) {
  const instruments = getInstrumentList();

  return (
    <div className="controls">
      <div className="control-group">
        <label htmlFor="instrument">Instrument</label>
        <select
          id="instrument"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
        >
          {instruments.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="root-note">Root Note</label>
        <select
          id="root-note"
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
        >
          {NOTES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="bpm">BPM: {bpm}</label>
        <input
          type="range"
          id="bpm"
          min="40"
          max="200"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </div>

      <div className="control-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={showNoteNames}
            onChange={(e) => {
              setShowNoteNames(e.target.checked);
              if (e.target.checked) setShowIntervals(false);
            }}
          />
          Show Notes
        </label>
        <label>
          <input
            type="checkbox"
            checked={showIntervals}
            onChange={(e) => {
              setShowIntervals(e.target.checked);
              if (e.target.checked) setShowNoteNames(false);
            }}
          />
          Show Intervals
        </label>
      </div>

      <div className="control-group button-group">
        {!isPlaying ? (
          <button className="btn btn-play" onClick={onPlayPattern}>
            Play
          </button>
        ) : (
          <button className="btn btn-stop" onClick={onStopPattern}>
            Stop
          </button>
        )}
        <button className="btn btn-random" onClick={onRandomize}>
          Random
        </button>
      </div>
    </div>
  );
}
