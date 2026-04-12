import { describe, expect, test } from 'vitest';
import { chords, getChordById, getChordsForInstrument } from './chords.js';

const JAZZ_FAMILIES = new Set([
  'Major 7',
  'Minor 7',
  'Dominant 7',
  'Minor 7 Flat 5',
  'Diminished 7',
  '6',
  'Minor 6',
  '9',
  '13',
  '6/9',
  'Altered Dominant',
]);

describe('canonical chord data', () => {
  function getVoicingsForInstrument(instrument, tuning) {
    return chords.flatMap((chord) =>
      chord.voicings
        .filter((voicing) => voicing.instrument === instrument && voicing.tuning === tuning)
        .map((voicing) => ({ ...voicing, chordId: chord.id, family: chord.family })),
    );
  }

  test('exports canonical chord ids instead of single-shape ids', () => {
    expect(chords.some((chord) => chord.id === 'cmaj7')).toBe(true);
    expect(chords.some((chord) => chord.id === 'cmaj7-guitar-standard-open')).toBe(false);
    expect(getChordById('cmaj7')).toMatchObject({
      id: 'cmaj7',
      name: 'Cmaj7',
    });
    expect(getChordById('cmaj7-guitar-standard-open')).toBeUndefined();
  });

  test('groups multiple voicings under a canonical chord for one instrument and tuning', () => {
    const cmaj7 = getChordById('cmaj7');
    const guitarStandardVoicings = cmaj7.voicings.filter(
      (voicing) => voicing.instrument === 'guitar' && voicing.tuning === 'standard',
    );

    expect(guitarStandardVoicings).toHaveLength(2);
    expect(guitarStandardVoicings[0]).toMatchObject({
      instrument: 'guitar',
      tuning: 'standard',
      label: expect.any(String),
      position: expect.any(Number),
      frets: expect.any(Array),
      barres: expect.any(Array),
    });
    expect(guitarStandardVoicings.map((voicing) => voicing.id)).toEqual(
      expect.arrayContaining([
        'cmaj7-guitar-standard-open',
        'cmaj7-guitar-standard-shell',
      ]),
    );
  });

  test('covers standard tuning for ukulele and mandolin', () => {
    const ukuleleVoicings = getVoicingsForInstrument('ukulele', 'standard');
    const mandolinVoicings = getVoicingsForInstrument('mandolin', 'standard');

    expect(ukuleleVoicings).not.toHaveLength(0);
    expect(mandolinVoicings).not.toHaveLength(0);
    expect(ukuleleVoicings.every(
      (voicing) => voicing.instrument === 'ukulele' && voicing.tuning === 'standard',
    )).toBe(true);
    expect(mandolinVoicings.every(
      (voicing) => voicing.instrument === 'mandolin' && voicing.tuning === 'standard',
    )).toBe(true);
    expect(getChordsForInstrument('ukulele', 'standard')).not.toHaveLength(0);
    expect(getChordsForInstrument('mandolin', 'standard')).not.toHaveLength(0);
  });

  test.each(['dropd', 'dadgad', 'openg'])(
    'exposes at least one extended or jazz voicing for guitar %s tuning',
    (tuning) => {
      const tuningVoicings = getVoicingsForInstrument('guitar', tuning);
      const jazzChords = tuningVoicings.filter((voicing) => JAZZ_FAMILIES.has(voicing.family));

      expect(jazzChords.length).toBeGreaterThan(0);
      expect(getChordsForInstrument('guitar', tuning)).not.toHaveLength(0);
    },
  );
});
