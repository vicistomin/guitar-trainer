import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const audioMocks = vi.hoisted(() => ({
  playNote: vi.fn(),
  playSequence: vi.fn(),
  stopAll: vi.fn(),
}));

vi.mock('./hooks/useAudio', () => ({
  useAudio: () => audioMocks,
}));

import App from './App';

function renderApp(pathname = '/guitar-trainer/') {
  window.history.replaceState({}, '', pathname);
  localStorage.setItem('guitar-trainer-settings', JSON.stringify({ autoStartEnabled: false }));

  return {
    ...render(<App />),
  };
}

describe('App behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    audioMocks.playNote.mockReset();
    audioMocks.playSequence.mockReset();
    audioMocks.stopAll.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('falls back to Major Scale when a standard-only chord becomes invalid for the selected tuning', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    expect(screen.getAllByText('C Major (Open)').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Tuning'), { target: { value: 'dadgad' } });

    expect(screen.getAllByText('Major Scale').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Root Note')).toBeInTheDocument();
  });

  test('falls back to Major Scale when a chord becomes invalid for the selected instrument', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    expect(screen.getAllByText('C Major (Open)').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Instrument'), { target: { value: 'ukulele' } });

    expect(screen.getByRole('heading', { name: 'Ukulele Trainer' })).toBeInTheDocument();
    expect(screen.getAllByText('Major Scale').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Root Note')).toBeInTheDocument();
  });

  test('normalizes invalid URL state back to a valid scale route', () => {
    renderApp('/guitar-trainer/ukulele/chords/not-a-pattern/c');

    vi.advanceTimersByTime(100);

    expect(window.location.pathname).toBe('/guitar-trainer/ukulele/scales/major-scale/c');
    expect(screen.queryByRole('button', { name: 'Chords' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Root Note')).toBeInTheDocument();
  });

  test('does not mark chord notes as scale roots', async () => {
    const { container } = renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));

    expect(container.querySelectorAll('.note-indicator.root')).toHaveLength(0);
  });

  test('does not render interval labels for chord shapes based on the hidden scale root', async () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('Root Note'), { target: { value: 'F#' } });
    fireEvent.click(screen.getByLabelText('Show Intervals'));
    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));

    expect(screen.queryAllByText('b5')).toHaveLength(0);
    expect(screen.queryAllByText('b7')).toHaveLength(0);
    expect(screen.queryAllByText('m2')).toHaveLength(0);
  });

  test('tracks chord practice progress by chord name instead of the last selected scale root', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    fireEvent.change(screen.getByLabelText('Root Note'), { target: { value: 'G' } });
    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    expect(screen.getAllByText('C Major (Open)').length).toBeGreaterThan(0);
    expect(screen.queryByText('G C Major (Open)')).not.toBeInTheDocument();
  });

  test('keeps the playback button in sync with the latest play cycle after stop and restart', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    vi.advanceTimersByTime(1000);

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    vi.advanceTimersByTime(2500);

    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });
});
