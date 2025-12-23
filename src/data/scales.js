// Scale definitions with intervals (semitones from root)
export const scales = [
  {
    id: 'major',
    name: 'Major Scale',
    category: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'The foundation of Western music, bright and happy sound',
  },
  {
    id: 'natural-minor',
    name: 'Natural Minor',
    category: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Sad, melancholic sound - relative minor of major scale',
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    category: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Minor scale with raised 7th - exotic, Middle Eastern flavor',
  },
  {
    id: 'melodic-minor',
    name: 'Melodic Minor',
    category: 'Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Minor scale with raised 6th and 7th - jazz staple',
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Minor with bright 6th - great for jazz and funk',
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    category: 'Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Dark, Spanish/Flamenco flavor with flat 2nd',
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    category: 'Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Dreamy, floating sound with raised 4th',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Major with flat 7th - blues and rock essential',
  },
  {
    id: 'locrian',
    name: 'Locrian Mode',
    category: 'Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'Diminished sound - unstable and tense',
  },
];

export const scaleCategories = ['Major', 'Minor', 'Modes'];

export function getScalesByCategory(category) {
  return scales.filter(scale => scale.category === category);
}

export function getScaleById(id) {
  return scales.find(scale => scale.id === id);
}
