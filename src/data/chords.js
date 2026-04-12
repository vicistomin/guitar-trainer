function createVoicing({ id, instrument, tuning, label, position, frets, barres = [] }) {
  return {
    id,
    instrument,
    tuning,
    label,
    position,
    frets,
    barres,
  };
}

function createChord({ id, name, family, category, description, voicings }) {
  return {
    id,
    name,
    family,
    category,
    description,
    voicings,
  };
}

function toLegacyChordName(chord, voicing) {
  if (chord.family === 'Major') {
    return `${chord.name} Major (${voicing.label})`;
  }

  if (chord.family === 'Minor' && chord.name.endsWith('m')) {
    return `${chord.name.slice(0, -1)} Minor (${voicing.label})`;
  }

  if (voicing.label === 'Open') {
    return chord.name;
  }

  return `${chord.name} (${voicing.label})`;
}

function toLegacyFlatShape(chord, voicing) {
  return {
    id: voicing.id,
    canonicalId: chord.id,
    name: toLegacyChordName(chord, voicing),
    category: chord.category,
    family: chord.family,
    type: 'chord',
    description: chord.description,
    instrument: voicing.instrument,
    tuning: voicing.tuning,
    label: voicing.label,
    position: voicing.position,
    frets: voicing.frets,
    barres: voicing.barres,
  };
}

export const chords = [
  createChord({
    id: 'c',
    name: 'C',
    family: 'Major',
    category: 'Core Chords',
    description: 'Foundational C major grips shared across the main fretted instruments.',
    voicings: [
      createVoicing({
        id: 'c-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 3, 2, 0, 1, 0],
      }),
      createVoicing({
        id: 'c-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 0, 0, 3],
      }),
      createVoicing({
        id: 'c-mandolin-standard-closed',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Closed',
        position: 5,
        frets: [5, 2, 3, 3],
      }),
    ],
  }),
  createChord({
    id: 'g',
    name: 'G',
    family: 'Major',
    category: 'Core Chords',
    description: 'A ringing major chord that works as a home-base voicing on every instrument.',
    voicings: [
      createVoicing({
        id: 'g-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [3, 2, 0, 0, 0, 3],
      }),
      createVoicing({
        id: 'g-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 2, 3, 2],
      }),
      createVoicing({
        id: 'g-mandolin-standard-open',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 0, 2, 3],
      }),
    ],
  }),
  createChord({
    id: 'd',
    name: 'D',
    family: 'Major',
    category: 'Core Chords',
    description: 'Bright treble-focused major shape for rhythm and melody support.',
    voicings: [
      createVoicing({
        id: 'd-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, null, 0, 2, 3, 2],
      }),
      createVoicing({
        id: 'd-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [2, 2, 2, 0],
      }),
      createVoicing({
        id: 'd-mandolin-standard-open',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [2, 0, 0, 2],
      }),
    ],
  }),
  createChord({
    id: 'am',
    name: 'Am',
    family: 'Minor',
    category: 'Core Chords',
    description: 'A compact minor shape that translates well between guitar and smaller instruments.',
    voicings: [
      createVoicing({
        id: 'am-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 0, 2, 2, 1, 0],
      }),
      createVoicing({
        id: 'am-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [2, 0, 0, 0],
      }),
      createVoicing({
        id: 'am-mandolin-standard-closed',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Closed',
        position: 2,
        frets: [2, 2, 3, 0],
      }),
    ],
  }),
  createChord({
    id: 'em',
    name: 'Em',
    family: 'Minor',
    category: 'Core Chords',
    description: 'An easy drone-friendly minor chord for open-string practice.',
    voicings: [
      createVoicing({
        id: 'em-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 2, 2, 0, 0, 0],
      }),
      createVoicing({
        id: 'em-ukulele-standard-color',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Color Grip',
        position: 2,
        frets: [0, 4, 3, 2],
      }),
      createVoicing({
        id: 'em-mandolin-standard-open',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 2, 2, 0],
      }),
    ],
  }),
  createChord({
    id: 'f',
    name: 'F',
    family: 'Major',
    category: 'Core Chords',
    description: 'A common first barre chord on guitar and a compact staple on ukulele.',
    voicings: [
      createVoicing({
        id: 'f-guitar-standard-barre',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Barre',
        position: 1,
        frets: [1, 3, 3, 2, 1, 1],
        barres: [{ fret: 1, fromString: 0, toString: 5 }],
      }),
      createVoicing({
        id: 'f-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [2, 0, 1, 0],
      }),
    ],
  }),
  createChord({
    id: 'cmaj7',
    name: 'Cmaj7',
    family: 'Major 7',
    category: 'Jazz Standards',
    description: 'Lush major-7 harmony with both open-string and compact shell textures.',
    voicings: [
      createVoicing({
        id: 'cmaj7-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 3, 2, 0, 0, 0],
      }),
      createVoicing({
        id: 'cmaj7-guitar-standard-shell',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Shell',
        position: 8,
        frets: [8, 10, 9, 9, 8, null],
      }),
      createVoicing({
        id: 'cmaj7-guitar-dropd-drone',
        instrument: 'guitar',
        tuning: 'dropd',
        label: 'Drone',
        position: 1,
        frets: [null, 3, 2, 0, 0, 0],
      }),
      createVoicing({
        id: 'cmaj7-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 0, 0, 2],
      }),
      createVoicing({
        id: 'cmaj7-mandolin-standard-closed',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Closed',
        position: 4,
        frets: [5, 4, 3, 2],
      }),
    ],
  }),
  createChord({
    id: 'am7',
    name: 'Am7',
    family: 'Minor 7',
    category: 'Jazz Standards',
    description: 'A soft minor-7 color used in ii-V-I movements and modal grooves.',
    voicings: [
      createVoicing({
        id: 'am7-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 0, 2, 0, 1, 0],
      }),
      createVoicing({
        id: 'am7-guitar-standard-barre',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Barre',
        position: 5,
        frets: [5, 7, 5, 5, 5, 5],
        barres: [{ fret: 5, fromString: 0, toString: 5 }],
      }),
      createVoicing({
        id: 'am7-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 0, 0, 0],
      }),
      createVoicing({
        id: 'am7-mandolin-standard-open',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [2, 0, 3, 0],
      }),
    ],
  }),
  createChord({
    id: 'g7',
    name: 'G7',
    family: 'Dominant 7',
    category: 'Dominant Colors',
    description: 'Classic dominant tension with both folk and jazz-friendly grips.',
    voicings: [
      createVoicing({
        id: 'g7-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [3, 2, 0, 0, 0, 1],
      }),
      createVoicing({
        id: 'g7-guitar-standard-shell',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Shell',
        position: 3,
        frets: [3, 5, 3, 4, 3, null],
      }),
      createVoicing({
        id: 'g7-ukulele-standard-open',
        instrument: 'ukulele',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 2, 1, 2],
      }),
      createVoicing({
        id: 'g7-mandolin-standard-open',
        instrument: 'mandolin',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [0, 0, 2, 1],
      }),
    ],
  }),
  createChord({
    id: 'bm7b5',
    name: 'Bm7b5',
    family: 'Minor 7 Flat 5',
    category: 'Jazz Standards',
    description: 'Half-diminished color for minor-key ii-V progressions.',
    voicings: [
      createVoicing({
        id: 'bm7b5-guitar-standard-shell',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Shell',
        position: 2,
        frets: [null, 2, 3, 2, 3, null],
      }),
    ],
  }),
  createChord({
    id: 'cdim7',
    name: 'Cdim7',
    family: 'Diminished 7',
    category: 'Jazz Standards',
    description: 'Symmetrical diminished shape for passing harmony and turnarounds.',
    voicings: [
      createVoicing({
        id: 'cdim7-guitar-standard-closed',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Closed',
        position: 3,
        frets: [null, 3, 4, 2, 4, null],
      }),
    ],
  }),
  createChord({
    id: 'c6',
    name: 'C6',
    family: '6',
    category: 'Jazz Standards',
    description: 'Warm major-six sonority for swing, western, and relaxed pop harmony.',
    voicings: [
      createVoicing({
        id: 'c6-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 3, 2, 2, 1, 0],
      }),
    ],
  }),
  createChord({
    id: 'am6',
    name: 'Am6',
    family: 'Minor 6',
    category: 'Jazz Standards',
    description: 'Minor-six color with a noir quality that sits between tonic and tension.',
    voicings: [
      createVoicing({
        id: 'am6-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 0, 2, 2, 1, 2],
      }),
    ],
  }),
  createChord({
    id: 'd9',
    name: 'D9',
    family: '9',
    category: 'Dominant Colors',
    description: 'A compact dominant-9 shape that can move between blues and jazz comping.',
    voicings: [
      createVoicing({
        id: 'd9-guitar-standard-shell',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Shell',
        position: 5,
        frets: [null, 5, 4, 5, 5, 5],
      }),
      createVoicing({
        id: 'd9-guitar-dadgad-drone',
        instrument: 'guitar',
        tuning: 'dadgad',
        label: 'Drone',
        position: 1,
        frets: [0, 0, 4, 2, 3, 0],
      }),
    ],
  }),
  createChord({
    id: 'g13',
    name: 'G13',
    family: '13',
    category: 'Dominant Colors',
    description: 'Bright dominant-13 color for turnarounds, funk comping, and modern blues.',
    voicings: [
      createVoicing({
        id: 'g13-guitar-standard-color',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Color Grip',
        position: 3,
        frets: [3, null, 3, 4, 5, 5],
      }),
      createVoicing({
        id: 'g13-guitar-openg-slide',
        instrument: 'guitar',
        tuning: 'openg',
        label: 'Slide-Friendly',
        position: 5,
        frets: [5, 5, 5, 5, 7, 5],
      }),
    ],
  }),
  createChord({
    id: 'c69',
    name: 'C6/9',
    family: '6/9',
    category: 'Jazz Standards',
    description: 'An open, consonant color chord that still sounds harmonically rich.',
    voicings: [
      createVoicing({
        id: 'c69-guitar-standard-open',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Open',
        position: 1,
        frets: [null, 3, 2, 2, 3, 3],
      }),
    ],
  }),
  createChord({
    id: 'g7b9',
    name: 'G7b9',
    family: 'Altered Dominant',
    category: 'Dominant Colors',
    description: 'A tense altered dominant voicing for minor resolutions and dramatic turnarounds.',
    voicings: [
      createVoicing({
        id: 'g7b9-guitar-standard-closed',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Closed',
        position: 3,
        frets: [3, 2, 3, 1, 3, 1],
      }),
      createVoicing({
        id: 'g7b9-guitar-dropd-grit',
        instrument: 'guitar',
        tuning: 'dropd',
        label: 'Grit',
        position: 3,
        frets: [3, 2, 3, 1, 3, 1],
      }),
    ],
  }),
  createChord({
    id: 'g7sharp5',
    name: 'G7#5',
    family: 'Altered Dominant',
    category: 'Dominant Colors',
    description: 'Altered dominant bite for tritone substitutions and cinematic cadences.',
    voicings: [
      createVoicing({
        id: 'g7sharp5-guitar-standard-color',
        instrument: 'guitar',
        tuning: 'standard',
        label: 'Color Grip',
        position: 3,
        frets: [3, 2, 3, 0, 0, 4],
      }),
    ],
  }),
];

export const chordCategories = [...new Set(chords.map((chord) => chord.category))];

export function getChordsByCategory(category) {
  return chords.filter((chord) => chord.category === category);
}

export function getChordById(id) {
  return chords.find((chord) => chord.id === id);
}

export function getChordVoicings(chordId, instrumentId, tuningId) {
  const chord = getChordById(chordId);

  if (!chord) {
    return [];
  }

  return chord.voicings.filter(
    (voicing) => voicing.instrument === instrumentId && voicing.tuning === tuningId,
  );
}

export function getChordsForInstrument(instrumentId, tuningId) {
  return chords.flatMap((chord) =>
    getChordVoicings(chord.id, instrumentId, tuningId).map((voicing) =>
      toLegacyFlatShape(chord, voicing),
    ),
  );
}
