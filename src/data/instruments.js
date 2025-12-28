// Instrument configurations
export const instruments = {
  guitar: {
    id: 'guitar',
    name: 'Guitar',
    strings: 6,
    frets: 15,
    // Standard tuning (low to high): E2, A2, D3, G3, B3, E4
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    tuningOctaves: [2, 2, 3, 3, 3, 4],
    fretMarkers: [3, 5, 7, 9, 12, 15],
    doubleFretMarkers: [12],
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    strings: 4,
    frets: 12,
    // Standard tuning (low to high): G4, C4, E4, A4 (re-entrant - G is high)
    tuning: ['G', 'C', 'E', 'A'],
    tuningOctaves: [4, 4, 4, 4],
    fretMarkers: [3, 5, 7, 10, 12],
    doubleFretMarkers: [12],
  },
};

export const DEFAULT_INSTRUMENT = 'guitar';

export function getInstrument(id) {
  return instruments[id] || instruments[DEFAULT_INSTRUMENT];
}

export function getInstrumentList() {
  return Object.values(instruments);
}
