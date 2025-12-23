// Pentatonic scale definitions
export const pentatonics = [
  {
    id: 'major-pentatonic',
    name: 'Major Pentatonic',
    category: 'Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: 'Bright, country/rock sound - no avoid notes',
  },
  {
    id: 'minor-pentatonic',
    name: 'Minor Pentatonic',
    category: 'Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'The rock/blues essential - works over almost anything',
  },
  {
    id: 'blues-scale',
    name: 'Blues Scale',
    category: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Minor pentatonic + blue note (b5) - soulful and gritty',
  },
  {
    id: 'major-blues',
    name: 'Major Blues Scale',
    category: 'Blues',
    intervals: [0, 2, 3, 4, 7, 9],
    description: 'Major pentatonic + blue note (b3) - country blues flavor',
  },
];

export const pentatonicCategories = ['Pentatonic', 'Blues'];

export function getPentatonicsByCategory(category) {
  return pentatonics.filter(p => p.category === category);
}

export function getPentatonicById(id) {
  return pentatonics.find(p => p.id === id);
}
