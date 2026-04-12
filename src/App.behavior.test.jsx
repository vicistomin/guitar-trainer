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

function setViewportWidth(width) {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
}

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
    setViewportWidth(1280);
    audioMocks.playNote.mockReset();
    audioMocks.playSequence.mockReset();
    audioMocks.stopAll.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('lists canonical chord names instead of individual voicing entries', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));

    expect(screen.getByRole('button', { name: 'Cmaj7' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'C Major (Open)' })).not.toBeInTheDocument();
  });

  test('selecting a canonical chord chooses the first valid voicing for the current instrument and tuning', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cmaj7' }));
    vi.advanceTimersByTime(100);

    expect(screen.getAllByText('Cmaj7').length).toBeGreaterThan(0);
    expect(screen.getByText('Voicing: Open')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-open');
  });

  test('falls back to the first valid chord when the selected chord has no voicing for the new tuning', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    expect(screen.getAllByText('C').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Tuning'), { target: { value: 'dadgad' } });

    expect(screen.getAllByText('D9').length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Root Note')).not.toBeInTheDocument();
  });

  test('falls back to the first valid chord when the selected chord has no voicing for the new instrument', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Chords' }));
    expect(screen.getAllByText('C').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Instrument'), { target: { value: 'ukulele' } });

    expect(screen.getByRole('heading', { name: 'Ukulele Trainer' })).toBeInTheDocument();
    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Root Note')).not.toBeInTheDocument();
  });

  test('keeps the same canonical chord when a new tuning has another voicing for it', async () => {
    renderApp('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-shell');

    fireEvent.change(screen.getByLabelText('Tuning'), { target: { value: 'dropd' } });
    vi.advanceTimersByTime(100);

    expect(screen.getAllByText('Cmaj7').length).toBeGreaterThan(0);
    expect(screen.getByText('Voicing: Drone')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/guitar-trainer/guitar/dropd/chords/cmaj7');
  });

  test('mobile chord mode shows one voicing at a time with navigation controls', async () => {
    setViewportWidth(390);
    renderApp('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-open');

    expect(screen.getByText('1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next Position' }));
    vi.advanceTimersByTime(100);

    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    expect(screen.getByText('Voicing: Shell')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-shell');
  });

  test('desktop chord mode renders multiple voicings of the same chord with distinct styling', async () => {
    const { container } = renderApp('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-open');

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shell' })).toBeInTheDocument();
    expect(container.querySelector('.note-indicator.chord-voicing-blue')).toBeInTheDocument();
    expect(container.querySelector('.note-indicator.chord-voicing-gold')).toBeInTheDocument();
  });

  test('desktop playback uses the focused voicing only', async () => {
    renderApp('/guitar-trainer/guitar/chords/am7/am7-guitar-standard-barre');

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    expect(audioMocks.playSequence).toHaveBeenCalledTimes(1);
    expect(audioMocks.playSequence.mock.calls[0][0]).toHaveLength(6);
  });

  test('normalizes invalid chord URL state back to the first valid chord route', () => {
    renderApp('/guitar-trainer/ukulele/chords/not-a-pattern/c');

    vi.advanceTimersByTime(100);

    expect(window.location.pathname).toBe('/guitar-trainer/ukulele/chords/c');
    expect(screen.getByRole('button', { name: 'Chords' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Root Note')).not.toBeInTheDocument();
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

    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    expect(screen.queryByText('G C')).not.toBeInTheDocument();
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
