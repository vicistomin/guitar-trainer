// Arpeggio definitions
export const arpeggios = [
  {
    id: 'major-triad',
    name: 'Major Triad',
    category: 'Triads',
    intervals: [0, 4, 7],
    description: 'Root, major 3rd, perfect 5th - bright and stable',
  },
  {
    id: 'minor-triad',
    name: 'Minor Triad',
    category: 'Triads',
    intervals: [0, 3, 7],
    description: 'Root, minor 3rd, perfect 5th - sad and stable',
  },
  {
    id: 'diminished-triad',
    name: 'Diminished Triad',
    category: 'Triads',
    intervals: [0, 3, 6],
    description: 'Root, minor 3rd, diminished 5th - tense and unstable',
  },
  {
    id: 'augmented-triad',
    name: 'Augmented Triad',
    category: 'Triads',
    intervals: [0, 4, 8],
    description: 'Root, major 3rd, augmented 5th - dreamy and unresolved',
  },
  {
    id: 'major-7',
    name: 'Major 7th',
    category: '7th Chords',
    intervals: [0, 4, 7, 11],
    description: 'Major triad + major 7th - jazzy and sophisticated',
  },
  {
    id: 'minor-7',
    name: 'Minor 7th',
    category: '7th Chords',
    intervals: [0, 3, 7, 10],
    description: 'Minor triad + minor 7th - smooth jazz staple',
  },
  {
    id: 'dominant-7',
    name: 'Dominant 7th',
    category: '7th Chords',
    intervals: [0, 4, 7, 10],
    description: 'Major triad + minor 7th - bluesy tension',
  },
  {
    id: 'half-diminished',
    name: 'Half-Diminished (m7b5)',
    category: '7th Chords',
    intervals: [0, 3, 6, 10],
    description: 'Diminished triad + minor 7th - minor ii chord in jazz',
  },
  {
    id: 'diminished-7',
    name: 'Diminished 7th',
    category: '7th Chords',
    intervals: [0, 3, 6, 9],
    description: 'Stacked minor 3rds - symmetrical and mysterious',
  },
  {
    id: 'minor-major-7',
    name: 'Minor Major 7th',
    category: '7th Chords',
    intervals: [0, 3, 7, 11],
    description: 'Minor triad + major 7th - dark and sophisticated',
  },
  {
    id: 'major-9',
    name: 'Major 9th',
    category: 'Extended',
    intervals: [0, 4, 7, 11, 2],
    description: 'Major 7th + 9th - lush and open',
  },
  {
    id: 'minor-9',
    name: 'Minor 9th',
    category: 'Extended',
    intervals: [0, 3, 7, 10, 2],
    description: 'Minor 7th + 9th - neo-soul favorite',
  },
  {
    id: 'dominant-9',
    name: 'Dominant 9th',
    category: 'Extended',
    intervals: [0, 4, 7, 10, 2],
    description: 'Dominant 7th + 9th - funky and bluesy',
  },
];

export const arpeggioCategories = ['Triads', '7th Chords', 'Extended'];

export function getArpeggiosByCategory(category) {
  return arpeggios.filter(a => a.category === category);
}

export function getArpeggioById(id) {
  return arpeggios.find(a => a.id === id);
}
