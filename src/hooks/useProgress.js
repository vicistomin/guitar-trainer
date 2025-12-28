import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'guitar-trainer-progress';
const SETTINGS_KEY = 'guitar-trainer-settings';
const AUTO_START_DELAY = 3000; // 3 seconds of active tab time before auto-start

const initialProgress = {
  sessions: [],
  totalPracticeTime: 0,
  patternsLearned: [],
  lastPracticeDate: null,
  streakDays: 0,
};

const defaultSettings = {
  autoStartEnabled: true,
};

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialProgress;
    } catch {
      return initialProgress;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [sessionStart, setSessionStart] = useState(null);
  const [currentSessionPatterns, setCurrentSessionPatterns] = useState([]);
  const autoStartTimerRef = useRef(null);
  const hasAutoStartedRef = useRef(false);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [progress]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Start a practice session
  const startSession = useCallback(() => {
    setSessionStart(Date.now());
    setCurrentSessionPatterns([]);
    hasAutoStartedRef.current = true;
  }, []);

  // Toggle auto-start setting
  const toggleAutoStart = useCallback(() => {
    setSettings(prev => ({ ...prev, autoStartEnabled: !prev.autoStartEnabled }));
  }, []);

  // Auto-start session based on tab visibility
  useEffect(() => {
    if (!settings.autoStartEnabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became active - start timer for auto-start
        if (!sessionStart && !hasAutoStartedRef.current) {
          autoStartTimerRef.current = setTimeout(() => {
            if (!sessionStart && document.visibilityState === 'visible') {
              startSession();
            }
          }, AUTO_START_DELAY);
        }
      } else {
        // Tab became hidden - clear auto-start timer
        if (autoStartTimerRef.current) {
          clearTimeout(autoStartTimerRef.current);
          autoStartTimerRef.current = null;
        }
      }
    };

    // Check initial state and start timer if visible
    if (document.visibilityState === 'visible' && !sessionStart && !hasAutoStartedRef.current) {
      autoStartTimerRef.current = setTimeout(() => {
        if (!sessionStart && document.visibilityState === 'visible') {
          startSession();
        }
      }, AUTO_START_DELAY);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }
    };
  }, [settings.autoStartEnabled, sessionStart, startSession]);

  // Track pattern practice
  const trackPattern = useCallback((patternName, rootNote) => {
    const patternKey = `${rootNote} ${patternName}`;
    setCurrentSessionPatterns(prev => {
      if (!prev.includes(patternKey)) {
        return [...prev, patternKey];
      }
      return prev;
    });
  }, []);

  // End session and save
  const endSession = useCallback(() => {
    if (!sessionStart) return;

    const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
    const today = new Date().toISOString().split('T')[0];

    setProgress(prev => {
      // Calculate streak
      let newStreak = prev.streakDays;
      if (prev.lastPracticeDate) {
        const lastDate = new Date(prev.lastPracticeDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
        // Same day = keep streak
      } else {
        newStreak = 1;
      }

      // Update patterns learned
      const newPatternsLearned = [...new Set([...prev.patternsLearned, ...currentSessionPatterns])];

      return {
        ...prev,
        sessions: [
          ...prev.sessions,
          {
            date: today,
            duration: sessionDuration,
            patterns: currentSessionPatterns,
          },
        ],
        totalPracticeTime: prev.totalPracticeTime + sessionDuration,
        patternsLearned: newPatternsLearned,
        lastPracticeDate: today,
        streakDays: newStreak,
      };
    });

    setSessionStart(null);
    setCurrentSessionPatterns([]);
  }, [sessionStart, currentSessionPatterns]);

  // Get statistics
  const getStats = useCallback(() => {
    const totalSessions = progress.sessions.length;
    const totalTime = progress.totalPracticeTime;
    const totalPatterns = progress.patternsLearned.length;

    // Get recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = progress.sessions.filter(
      s => new Date(s.date) >= sevenDaysAgo
    );

    const weeklyTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions,
      totalTime,
      totalPatterns,
      weeklyTime,
      streak: progress.streakDays,
      recentSessions,
    };
  }, [progress]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  // Reset all progress
  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
    setSessionStart(null);
    setCurrentSessionPatterns([]);
  }, []);

  return {
    progress,
    sessionStart,
    currentSessionPatterns,
    startSession,
    endSession,
    trackPattern,
    getStats,
    formatTime,
    resetProgress,
    isSessionActive: sessionStart !== null,
    autoStartEnabled: settings.autoStartEnabled,
    toggleAutoStart,
  };
}
