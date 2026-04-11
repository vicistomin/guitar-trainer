import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useProgress } from './useProgress';

function setVisibilityState(state) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibilityState('visible');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('tracks chord practice labels without injecting a hidden root note', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.startSession();
    });

    act(() => {
      result.current.trackPattern('C Major (Open)');
    });

    act(() => {
      result.current.endSession();
    });

    const stats = result.current.getStats();

    expect(stats.totalPatterns).toBe(1);
    expect(result.current.progress.patternsLearned).toEqual(['C Major (Open)']);
  });

  test('auto-start can trigger again after a session ends', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isSessionActive).toBe(true);

    act(() => {
      result.current.endSession();
    });

    expect(result.current.isSessionActive).toBe(false);

    act(() => {
      setVisibilityState('hidden');
      setVisibilityState('visible');
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isSessionActive).toBe(true);
  });

  test('resetting progress clears the auto-start gate', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isSessionActive).toBe(true);

    act(() => {
      result.current.resetProgress();
    });

    act(() => {
      setVisibilityState('hidden');
      setVisibilityState('visible');
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isSessionActive).toBe(true);
  });
});
