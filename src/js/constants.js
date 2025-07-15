export const START_NOTES = [
  ["C", "B#"],
  ["C#", "Db"],
  "D",
  ["D#", "Eb"],
  ["E", "Fb"],
  ["F", "E#"],
  ["F#", "Gb"],
  "G",
  ["G#", "Ab"],
  "A",
  ["A#", "Bb"],
  ["B", "Cb"],
];

// ES6 Array methods:
// @see https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
export const OCTAVES = Array.from(new Array(8), (x, index) => index);

export const CONSTANTS = {
  // Named constants for MIDI and rendering
  MIDI_NOTE_LENGTH_MS: 3000,
  MIDI_LOOP_START: 24, // C1
  MIDI_START_TIME_INDEX_MS: 9000, // C1 offset in sound file

  SVG_WIDTH: 280,
  SVG_HEIGHT: 240,
  STAVE_X: 10,
  STAVE_Y: 20,
  STAVE_WIDTH: 240,
  MIDI_NOTE_LENGTH_MS: 3000,
  MIDI_LOOP_START: 24,
  MIDI_START_TIME_INDEX_MS: 9000,
};
