import { Howl } from "howler";
import { Note } from "tonal";
import soundsUrl from "../../assets/sounds.mp3";
import { CONSTANTS } from "../constants.js";

/**
 * Generates a MIDI sprite configuration for Howler.js.
 * @returns {Object} MIDI sprite configuration object.
 *
 * Helper function to generate MIDI sprite configuration
 */
function generateMidiSprites() {
  const sprites = {};
  let startTimeIndex = CONSTANTS.MIDI_START_TIME_INDEX_MS;
  for (let i = CONSTANTS.MIDI_LOOP_START; i <= 108; i++) {
    sprites[i.toString()] = [startTimeIndex, CONSTANTS.MIDI_NOTE_LENGTH_MS];
    startTimeIndex += CONSTANTS.MIDI_NOTE_LENGTH_MS;
  }
  return sprites;
}

/**
 * Initializes the sound engine with Howler.js.
 * It loads the sound file and sets up MIDI sprites for playback.
 *
 * Howler initialisation with sprites defined using public API
 */
const sound = new Howl({
  src: [soundsUrl],
  sprite: generateMidiSprites(), // ✅ Use public API instead of private _sprite
  onload() {
    console.log("sound file loaded with sprites");
  },
  onloaderror(error, msg) {
    console.error(
      "Error loading the sound file. Error:",
      error,
      "\nMessage:",
      msg
    );
    // Error handling: Show user-friendly message when audio fails to load
    const audioErrorMsg = document.createElement("div");
    audioErrorMsg.className =
      "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm";
    audioErrorMsg.innerHTML =
      "⚠️ Audio unavailable - chord visualization will work without sound";
    document.body.insertBefore(audioErrorMsg, document.body.firstChild);
  },
});

/**
 *  Sound engine for playing chords and notes.
 *  Handles audio playback using Howler.js and MIDI sprites.
 *  It initializes the sound file, defines MIDI sprites, and provides methods for playing chords.
 *  Note: This module encapsulates sound functionality and error handling for audio playback.
 */
export const soundEngine = {
  /**
   * Plays the result chord sequence using Howler.js.
   * Converts note names to MIDI, validates, and plays each note.
   * @param {Array<string>} soundSequence - Array of note names to play.
   * @returns {void}
   */
  playResult(soundSequence) {
    try {
      // Error handling: Validate input
      if (!soundSequence || soundSequence.length === 0) {
        console.warn("No notes provided for audio playback");
        modal.showError(
          "Octave Selector Error",
          "Octave selector is missing from the page.",
          "Element with id 'octave-selector' not found."
        );
        return;
      }

      // Put all the MIDI nummbers in an array
      const soundSequenceMidiNumbers = soundSequence.map((noteName) => {
        const midiNumber = Note.midi(noteName);
        // Error handling: Check if MIDI conversion was successful
        if (midiNumber === null || midiNumber === undefined) {
          throw new Error(`Unable to convert note to MIDI: ${noteName}`);
        }
        return midiNumber;
      });

      // Error handling: Check if sound is loaded before playing
      if (!sound || sound.state() !== "loaded") {
        console.warn("Audio not ready for playback");
        modal.showError(
          "Audio Not Loaded",
          "Chord audio is not available. Visualization will work without sound.",
          "Sound file is not loaded or failed to load."
        );
        return;
      }

      // Fade out any currently playing sounds to avoid harsh audio cutoff
      // This provides a smooth transition when switching between chords
      // The fade prevents jarring audio artifacts that would occur with sound.stop()
      sound.fade(1, 0, 1000);
      sound.volume(0.2);
      soundSequenceMidiNumbers.forEach((noteMidiNumber) => {
        // Error handling: Validate MIDI number is in range
        if (noteMidiNumber < 24 || noteMidiNumber > 108) {
          console.warn(
            `MIDI note ${noteMidiNumber} out of range (24-108), skipping`
          );
          return;
        }
        sound.play(noteMidiNumber.toString());
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      // Show error modal to user
      modal.showError(
        "Audio Playback Error",
        "Unable to play chord audio. The chord visualization is still available.",
        error.message
      );
    }
  },
};
