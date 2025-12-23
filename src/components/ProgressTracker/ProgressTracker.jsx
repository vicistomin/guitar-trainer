import { useState, useEffect } from 'react';
import './ProgressTracker.css';

export function ProgressTracker({
  isSessionActive,
  sessionStart,
  currentSessionPatterns,
  onStartSession,
  onEndSession,
  getStats,
  formatTime,
  onResetProgress,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const stats = getStats();

  // Update session timer
  useEffect(() => {
    if (!isSessionActive || !sessionStart) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, sessionStart]);

  const handleReset = () => {
    if (showConfirmReset) {
      onResetProgress();
      setShowConfirmReset(false);
    } else {
      setShowConfirmReset(true);
    }
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h3>Practice Progress</h3>
        {!isSessionActive ? (
          <button className="btn btn-start-session" onClick={onStartSession}>
            Start Session
          </button>
        ) : (
          <button className="btn btn-end-session" onClick={onEndSession}>
            End Session
          </button>
        )}
      </div>

      {/* Current session */}
      {isSessionActive && (
        <div className="current-session">
          <div className="session-timer">
            <span className="timer-label">Session Time</span>
            <span className="timer-value">{formatTime(currentTime)}</span>
          </div>
          <div className="session-patterns">
            <span className="patterns-label">Patterns Practiced</span>
            <span className="patterns-value">{currentSessionPatterns.length}</span>
          </div>
          {currentSessionPatterns.length > 0 && (
            <div className="patterns-list">
              {currentSessionPatterns.map((pattern, i) => (
                <span key={i} className="pattern-chip">
                  {pattern}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Total Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatTime(stats.totalTime)}</span>
          <span className="stat-label">Total Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalPatterns}</span>
          <span className="stat-label">Patterns Learned</span>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="weekly-progress">
        <h4>This Week</h4>
        <div className="weekly-stat">
          <span>Practice Time:</span>
          <span className="weekly-value">{formatTime(stats.weeklyTime)}</span>
        </div>
        <div className="weekly-stat">
          <span>Sessions:</span>
          <span className="weekly-value">{stats.recentSessions.length}</span>
        </div>
      </div>

      {/* Reset button */}
      <div className="reset-section">
        <button
          className={`btn btn-reset ${showConfirmReset ? 'confirm' : ''}`}
          onClick={handleReset}
          onBlur={() => setShowConfirmReset(false)}
        >
          {showConfirmReset ? 'Click again to confirm' : 'Reset Progress'}
        </button>
      </div>
    </div>
  );
}
