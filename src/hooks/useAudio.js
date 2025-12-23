import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioContextRef = useRef(null);
  const scheduledNodesRef = useRef([]);

  // Initialize audio context on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play a single note
  const playNote = useCallback((frequency, duration = 0.5, startTime = 0) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime + startTime;

    // Create oscillator for the tone
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle'; // Softer than sawtooth, more guitar-like

    // Create gain node for envelope
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Set frequency
    oscillator.frequency.setValueAtTime(frequency, now);

    // ADSR envelope (simplified)
    const attackTime = 0.02;
    const decayTime = 0.1;
    const sustainLevel = 0.3;
    const releaseTime = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);

    // Track for cleanup
    scheduledNodesRef.current.push({ oscillator, gainNode, stopTime: now + duration + 0.1 });

    return { oscillator, gainNode };
  }, [getAudioContext]);

  // Play a sequence of notes
  const playSequence = useCallback((notes, bpm = 120, loop = false) => {
    const noteDuration = 60 / bpm; // Duration in seconds per beat
    const ctx = getAudioContext();

    // Stop any existing playback
    stopAll();

    let currentTime = 0;
    const playNotes = () => {
      notes.forEach((note, index) => {
        playNote(note.frequency, noteDuration * 0.9, currentTime + index * noteDuration);
      });
    };

    playNotes();

    if (loop) {
      const totalDuration = notes.length * noteDuration * 1000;
      const intervalId = setInterval(() => {
        currentTime = ctx.currentTime;
        playNotes();
      }, totalDuration);

      return () => clearInterval(intervalId);
    }
  }, [getAudioContext, playNote]);

  // Stop all scheduled notes
  const stopAll = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    scheduledNodesRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
        oscillator.stop(now + 0.1);
      } catch (e) {
        // Oscillator may have already stopped
      }
    });
    scheduledNodesRef.current = [];
  }, []);

  // Play a click/metronome sound
  const playClick = useCallback((high = false) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(high ? 1000 : 800, now);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }, [getAudioContext]);

  return {
    playNote,
    playSequence,
    stopAll,
    playClick,
    getAudioContext,
  };
}
