// Instrument configurations with multiple tuning support
export const instruments = {
  guitar: {
    id: 'guitar',
    name: 'Guitar',
    strings: 6,
    frets: 15,
    fretMarkers: [3, 5, 7, 9, 12, 15],
    doubleFretMarkers: [12],
    defaultTuning: 'standard',
    tunings: {
      standard: {
        id: 'standard',
        name: 'Standard (EADGBE)',
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        tuningOctaves: [2, 2, 3, 3, 3, 4],
      },
      dadgad: {
        id: 'dadgad',
        name: 'DADGAD',
        tuning: ['D', 'A', 'D', 'G', 'A', 'D'],
        tuningOctaves: [2, 2, 3, 3, 3, 4],
      },
      dropd: {
        id: 'dropd',
        name: 'Drop D',
        tuning: ['D', 'A', 'D', 'G', 'B', 'E'],
        tuningOctaves: [2, 2, 3, 3, 3, 4],
      },
      openg: {
        id: 'openg',
        name: 'Open G',
        tuning: ['D', 'G', 'D', 'G', 'B', 'D'],
        tuningOctaves: [2, 2, 3, 3, 3, 4],
      },
    },
  },
  mandolin: {
    id: 'mandolin',
    name: 'Mandolin',
    strings: 4,
    frets: 17,
    fretMarkers: [3, 5, 7, 10, 12, 15, 17],
    doubleFretMarkers: [12],
    defaultTuning: 'standard',
    tunings: {
      standard: {
        id: 'standard',
        name: 'Standard (GDAE)',
        tuning: ['G', 'D', 'A', 'E'],
        tuningOctaves: [3, 4, 4, 5],
      },
    },
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    strings: 4,
    frets: 12,
    fretMarkers: [3, 5, 7, 9, 12],
    doubleFretMarkers: [12],
    defaultTuning: 'standard',
    tunings: {
      standard: {
        id: 'standard',
        name: 'Standard (GDAE)',
        tuning: ['G', 'D', 'A', 'E'],
        tuningOctaves: [3, 4, 4, 5],
      },
    },
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    strings: 4,
    frets: 12,
    fretMarkers: [3, 5, 7, 10, 12],
    doubleFretMarkers: [12],
    defaultTuning: 'standard',
    tunings: {
      standard: {
        id: 'standard',
        name: 'Standard (GCEA)',
        tuning: ['G', 'C', 'E', 'A'],
        tuningOctaves: [4, 4, 4, 4],
      },
    },
  },
};

export const DEFAULT_INSTRUMENT = 'guitar';

// Get instrument config with a specific tuning applied
export function getInstrumentWithTuning(id, tuningId) {
  const instrument = instruments[id] || instruments[DEFAULT_INSTRUMENT];
  const resolvedTuningId = tuningId || instrument.defaultTuning;
  const tuningConfig = instrument.tunings[resolvedTuningId] || instrument.tunings[instrument.defaultTuning];

  return {
    ...instrument,
    tuning: tuningConfig.tuning,
    tuningOctaves: tuningConfig.tuningOctaves,
    activeTuning: tuningConfig,
  };
}

// Backward-compatible: get instrument with default tuning
export function getInstrument(id) {
  return getInstrumentWithTuning(id, null);
}

export function getInstrumentList() {
  return Object.values(instruments);
}

// Get available tunings for an instrument
export function getTuningList(instrumentId) {
  const instrument = instruments[instrumentId] || instruments[DEFAULT_INSTRUMENT];
  return Object.values(instrument.tunings);
}
