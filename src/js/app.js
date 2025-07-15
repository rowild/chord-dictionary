/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
 */
import { Note, Chord, ChordType } from "tonal";
import { Howl } from "howler";
import VexFlow from "vexflow";
import { gsap } from "gsap";
import soundsUrl from "../assets/sounds.mp3";

// Important containers
const startNoteSelector = document.getElementById("note-selector");
const octaveSelector = document.getElementById("octave-selector");
const chordSelector = document.getElementById("chord-selector");

const chosenRootNoteElem = document.getElementById("chosen-root-note");
const chosenChordElem = document.getElementById("chosen-chord");
const chordResultElem = document.getElementById("chord-result");
const notesResultElem = document.getElementById("notes-result");

const notatedResultElem = document.getElementById("notated-result");

const inputField = document.getElementById("filterChords");

// Named constants for MIDI and rendering
const MIDI_NOTE_LENGTH_MS = 3000;
const MIDI_LOOP_START = 24; // C1
const MIDI_START_TIME_INDEX_MS = 9000; // C1 offset in sound file
const SVG_WIDTH = 280;
const SVG_HEIGHT = 240;
const STAVE_X = 10;
const STAVE_Y = 20;
const STAVE_WIDTH = 240;

/// Simple native debounce function - keeping the code for future reference
// const debounce = (callback, delay) => {
//   let timeoutId = null
//   return (...args) => {
//     clearTimeout(timeoutId)
//     timeoutId = setTimeout(() => callback.apply(null, args), delay)
//   }
// }

/**
 * Debounce utility with cancel method.
 * @param {Function} fn - Function to debounce.
 * @param {number} delay - Delay in ms.
 * @returns {Function} Debounced function with .cancel()
 *
 * using a function declaration makes it hoisted and available anywhere in
 * the file, while a const is only available after its definition.
 */
function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Generates a MIDI sprite configuration for Howler.js.
 * @returns {Object} MIDI sprite configuration object.
 *
 * Helper function to generate MIDI sprite configuration
 */
function generateMidiSprites() {
  const sprites = {};
  let startTimeIndex = MIDI_START_TIME_INDEX_MS;
  for (let i = MIDI_LOOP_START; i <= 108; i++) {
    sprites[i.toString()] = [startTimeIndex, MIDI_NOTE_LENGTH_MS];
    startTimeIndex += MIDI_NOTE_LENGTH_MS;
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
 * VexFlow initialisation with debug mode enabled.
 */
const VF = VexFlow;
VF.Clef.DEBUG = true;
let renderer = undefined; // will be defined in setupNotation()
let context = undefined;
let stave = undefined;

/**
 * Helper to animate modal open/close transitions.
 * @param {HTMLElement} modalElem - The modal container element.
 * @param {HTMLElement} contentElem - The modal content element.
 * @param {boolean} open - If true, animate open; if false, animate close.
 * @param {Function} [onComplete] - Optional callback after close animation.
 */
function animateModal(modalElem, contentElem, open, onComplete) {
  const tl = gsap.timeline({ onComplete });
  if (open) {
    tl.to(modalElem, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    }).fromTo(
      contentElem,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      "-=0.1"
    );
  } else {
    tl.to(contentElem, {
      scale: 0.8,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      modalElem,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.1"
    );
  }
}

/**
 * Custom App
 */
const startNotes = [
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
const octaves = Array.from(new Array(8), (x, index) => index);

const app = {
  /**
   * Cache DOM elements at startup for better performance
   */
  elements: {
    filterInput: null,
    chordItems: null,
    foundItems: null,
  },
  /**
   * Application state - encapsulated within app object
   */
  state: {
    selectedStartNote: "C",
    selectedOctave: "1",
    selectedChord: null,
  },
  /**
   * Updates the displayed chosen root note and chord.
   * @returns {void}
   */
  updateChosenRootNoteElem() {
    chosenRootNoteElem.textContent =
      this.state.selectedStartNote + this.state.selectedOctave;
    if (this.state.selectedChord !== null) {
      chosenChordElem.textContent = this.state.selectedChord;
    }
  },
  /**
   * Sets up the initial state of the application.
   * Creates buttons for each start note and adds them to the note selector.
   * Handles both single notes and arrays of enharmonic notes.
   * @returns {void}
   */
  setupStartNotes() {
    if (!startNoteSelector) {
      console.warn("startNoteSelector element not found");
      modal.showError(
        "Start Note Selector",
        "startNoteSelector element not found",
        "Element with id 'octave-selector' not found."
      );
      return;
    }
    // create buttons and add them to their respective container
    startNotes.forEach((note) => {
      if (typeof note === "string") {
        const noteBtn = this.createElem("button", note);
        startNoteSelector.append(noteBtn);
      } else {
        const enharmonicContainer = document.createElement("div");
        enharmonicContainer.classList.add("flex");
        note.forEach((enharmonicNote) => {
          const enharmonicNoteNameOption = this.createElem(
            "button",
            enharmonicNote
          );
          enharmonicContainer.append(enharmonicNoteNameOption);
        });
        startNoteSelector.append(enharmonicContainer);
      }
    });
  },
  /**
   * Creates buttons for each octave and adds them to the octave selector.
   * Octaves are represented as numbers from 0 to 7.
   * @returns {void}
   */
  setupOctaves() {
    if (!octaveSelector) {
      console.warn("octaveSelector element not found");
      // Optionally show error modal to user:
      modal.showError(
        "Octave Selector Error",
        "Octave selector is missing from the page.",
        "Element with id 'octave-selector' not found."
      );
      return;
    }
    // create buttons and add them to their respective containers
    octaves.forEach((index) => {
      const octaveBtn = this.createElem("button", index);
      octaveSelector.append(octaveBtn);
    });
  },
  /**
   * Generates buttons for all available chord types using Tonal.js.
   * Uses the first alias of each chord type as the button text.
   * @returns {void}
   */
  setupChordBtns() {
    if (!chordSelector) {
      console.warn("chordSelector element not found");
      // Optionally show error modal to user:
      modal.showError(
        "Chord Selector Error",
        "Chord selector is missing from the page.",
        "Element with id 'chord-selector' not found."
      );
      return;
    }
    // Keep second param "index" for potential future use (e.g., debugging)
    ChordType.all().map((entry, index) => {
      // 34 = dim, 38 = dim7, 96 = alt7 // fixed with version 3.4.4 or so...
      // if(index >= 34 && index <= 38 || index === 96) {
      //   console.log(index + '. entry =', entry);
      // }
      const chordBtn = this.createElem("button", entry.aliases[0]);
      chordSelector.append(chordBtn);
    });
    // Note: chordEntry variable preserved for potential future use (e.g., debugging, chord metadata)
    // Currently unused but may be needed for chord type analysis or logging
  },
  /**
   * Sets up event listeners for the start note, octave, chord selectors, and input field.
   * Handles user interactions and updates the UI accordingly.
   * @returns {void}
   */
  setupEventListeners() {
    if (!startNoteSelector || !octaveSelector || !chordSelector || !inputField) {
      console.warn("One or more selector elements not found");
      // Optionally show error modal to user:
      modal.showError(
        "UI Initialization Error",
        "Some UI controls are missing and the app may not work as expected.",
        "Check that all required elements exist in the HTML."
      );
      return;
    }
    // Event delegation with proper button targeting - more robust than tagName checking
    startNoteSelector.addEventListener("click", (e) => {
      if (!e.target.matches("button")) return;
      this.state.selectedStartNote = e.target.textContent;
      this.updateChosenRootNoteElem();
    });
    octaveSelector.addEventListener("click", (e) => {
      if (!e.target.matches("button")) return;
      this.state.selectedOctave = e.target.textContent;
      this.updateChosenRootNoteElem();
    });
    chordSelector.addEventListener("click", (e) => {
      // Event delegation: only respond to button clicks, ignore container clicks
      if (!e.target.matches("button")) return;
      this.state.selectedChord = e.target.textContent;
      this.updateChosenRootNoteElem();
      this.displayChordInfo();
    });
    const debouncedFilter = debounce(this.filterChords.bind(this), 500);
    inputField.addEventListener("keyup", debouncedFilter);
    inputField.addEventListener("blur", debouncedFilter.cancel);
  },
  /**
   * Displays the chord information based on the selected root note, octave, and chord type.
   * Transposes chord intervals, plays sound, and draws musical notation.
   * Handles chord validation and error handling for invalid chords.
   * @returns {void}
   */
  displayChordInfo() {
    // Workaround pre tonaljs 3.4.4, when dim, dim7 and add7 were broken
    // if(this.state.selectedChord === 'dim' || this.state.selectedChord === 'dim7') {
    //   this.state.selectedChord = '°7'
    // }

    // "alt7" causes troubles. This might affect more than just "alt7" chord,
    // since it is a check agains "emptry === true", which is the case with
    // various chords
    // let chordIntervals = null;
    // if(chord(this.state.selectedChord).empty !== true) {
    //   chordIntervals = chord(this.state.selectedChord).intervals
    // } else {
    //   chordIntervals = chordType(this.state.selectedChord).intervals
    // }

    // console.log('selectedChord =', this.state.selectedChord);
    // console.log('chord(selectedChord =', chord(this.state.selectedChord));

    try {
      let chordIntervals = Chord.get(this.state.selectedChord).intervals;

      // Error handling: Check if chord is valid (has intervals)
      if (!chordIntervals || chordIntervals.length === 0) {
        throw new Error(
          `Invalid or unrecognized chord: ${this.state.selectedChord}`
        );
      }

      chordResultElem.textContent = chordIntervals.join(" – ");

      const userCreatedRootNote =
        this.state.selectedStartNote + this.state.selectedOctave;
      const transposedNotes = chordIntervals.map((val) => {
        const transposed = Note.transpose(userCreatedRootNote, val);
        // Error handling: Check if note transposition was successful
        if (!transposed) {
          throw new Error(
            `Failed to transpose note: ${userCreatedRootNote} + ${val}`
          );
        }
        return transposed;
      });
      notesResultElem.textContent = transposedNotes.join(" – ");

      soundEngine.playResult(transposedNotes);
      this.drawNotes(transposedNotes);
    } catch (error) {
      console.error("Error displaying chord info:", error);
      // Display user-friendly error message
      chordResultElem.textContent = "Error: Unable to process chord";
      notesResultElem.textContent = "Please try a different chord";
      // Show error modal to user
      modal.showError(
        "Chord Processing Error",
        "Unable to process the selected chord. Please try a different chord.",
        error.message
      );
      // Don't attempt to play sound or draw notes if chord is invalid
    }
  },
  /**
   * Sets up the VexFlow stave for musical notation rendering.
   * Initializes renderer, context, and stave, and adds the clef.
   * @param {Object} [clefDef={}] - Clef configuration object.
   * @returns {void}
   */
  setupStave(clefDef = {}) {
    if (!notatedResultElem) {
      console.warn("notatedResultElem not found");
      modal.showError(
        "Notation Error",
        "Unable to display musical notation.",
        "Element with id 'notated-result' not found."
      );
      return;
    }
    // console.log('clefDef =', clefDef);
    renderer = new VF.Renderer(notatedResultElem, VF.Renderer.Backends.SVG);
    renderer.resize(SVG_WIDTH, SVG_HEIGHT);
    context = renderer.getContext();
    stave = new VF.Stave(STAVE_X, STAVE_Y, STAVE_WIDTH);
    // stave.addClef(type, size, annotation)
    //   size = "default" or "small"
    //   annotation = "8va" or "8vb"; pass "undefined", if no annotation is wanted
    if (
      Object.entries(clefDef).length === 0 &&
      clefDef.constructor === Object
    ) {
      clefDef = {
        clefType: "treble",
        clefSize: "default",
        clefAnnotation: undefined,
      };
    }
    stave.addClef(clefDef.clefType, clefDef.clefSize, clefDef.clefAnnotation);
    // .addTimeSignature('4/4')
    stave.setContext(context).draw();
  },
  /**
   * Determines the appropriate clef configuration based on note range
   * @param {Array} notes - Array of note strings (e.g., ['C4', 'E4', 'G4'])
   * @returns {Object} - Clef configuration {clefType, clefSize, clefAnnotation}
   */
  determineClef(notes) {
    // Use Tonal's Note.octave() for reliable parsing of note strings
    // This handles double-digit octaves and complex accidentals properly
    let lowestNoteInChord = Note.octave(notes[0]);
    let highestNoteInChord = Note.octave(notes[notes.length - 1]);

    // Error handling: Validate octave extraction
    if (
      lowestNoteInChord === null ||
      lowestNoteInChord === undefined ||
      highestNoteInChord === null ||
      highestNoteInChord === undefined
    ) {
      throw new Error(
        `Unable to determine octave from note strings: ${notes[0]} - ${
          notes[notes.length - 1]
        }`
      );
    }

    let clefType = "treble";
    let clefSize = "default"; // "default" or "small"
    let clefAnnotation = undefined; // ottava symbol

    // Clef selection logic based on note range
    if (lowestNoteInChord > 5 || highestNoteInChord > 6) {
      clefAnnotation = "8va";
    } else if (highestNoteInChord >= 2 && highestNoteInChord < 4) {
      clefType = "bass";
    } else if (highestNoteInChord < 2) {
      clefType = "bass";
      clefAnnotation = "8vb";
    }

    return { clefType, clefSize, clefAnnotation };
  },

  /**
   * Draws musical notation for the given notes using VexFlow.
   * Calculates clef, collects accidentals, and formats notes for rendering.
   * Handles errors related to note format and clef calculation.
   * @param {Array<string>} notes - Array of note strings.
   * @returns {void}
   */
  drawNotes(notes) {
    if (!Array.isArray(notes) || notes.length === 0) {
      console.warn("drawNotes expects a non-empty array of strings");
      modal.showError(
        "Notation Error",
        "No notes provided for notation.",
        "drawNotes was called with invalid parameters."
      );
      return;
    }
    try {
      // Error handling: Validate input notes
      if (!notes || notes.length === 0) {
        throw new Error("No notes provided for notation");
      }

      // Use helper function to determine clef configuration
      const clefDef = this.determineClef(notes);

      // Re-draw the canvas
      if (context && context.svg && context.svg.childNodes) {
        notatedResultElem.removeChild(context.svg);
        this.setupStave(clefDef);
      }

      // "Collect" accidentals
      let vexAccidentals = [];

      // "Collect" VexFlow-readable notes, transposed, if clef has annotation
      let vexNotes = notes.map((n) => {
        if (!n || typeof n !== "string") {
          throw new Error(`Invalid note format: ${n}`);
        }

        // Old solution: n.slice is not reliable for complex notes like "C#4" or "Eb5"
        // let note = n.slice(0, -1).toLowerCase()
        // let register = n.slice(-1)

        // Use Tonal to parse note name and octave
        const noteName = Note.pitchClass(n).toLowerCase(); // e.g., "c#", "eb"
        const octave = Note.octave(n); // e.g., 4, 10

        // Error handling: Validate note components
        if (!noteName || !octave) {
          throw new Error(`Unable to parse note: ${n}`);
        }

        // Transpose notes, if the clef received an annotation
        let register = octave;

        // Transpose notes, if the clef received an annotation
        if (clefDef.clefAnnotation === "8vb") {
          register = octave + 1;
        }
        if (clefDef.clefAnnotation === "8va") {
          register = octave - 1;
        }

        // Check, if there are accidentals
        // If noteName has more than one character, the rest is the accidental
        let accidental = noteName.length > 1 ? noteName.slice(1) : "";
        vexAccidentals.push(noteName.slice(1, noteName.length));

        // Build the not in form of "c/4"
        return noteName + "/" + register.toString();
      });

      // Draw notes
      let staveNotes = [
        new VF.StaveNote({
          clef: clefDef.clefType,
          keys: vexNotes,
          duration: "w",
        }),
      ];

      // Draw accidentals
      vexAccidentals.map((acc, index) => {
        if (acc === "") return;
        staveNotes[0].addModifier(new VF.Accidental(acc), index);
      });

      // VexFlow helper function to format and build everything
      VF.Formatter.FormatAndDraw(context, stave, staveNotes);
    } catch (error) {
      console.error("Error drawing musical notation:", error);
      // Clear the notation area and show error message
      if (notatedResultElem) {
        notatedResultElem.innerHTML =
          '<div class="p-4 text-red-600 text-sm">Unable to display notation</div>';
      }
      // Show error modal to user
      modal.showError(
        "Notation Display Error",
        "Unable to display musical notation for this chord. The chord information is still available above.",
        error.message
      );
    }
  },
  /**
   * Creates a DOM element of the specified type with the given text value.
   * @param {string} elemType - The type of the element to create (e.g., 'button', 'div').
   * @param {string|number} val - The text value to set as the inner text of the element.
   * @returns {HTMLElement} The created DOM element.
   */
  createElem(elemType, val) {
    if (typeof elemType !== "string" || !elemType) {
      console.warn("Invalid element type for createElem:", elemType);
      modal.showError(
        "Element Creation Error",
        "Failed to create DOM element.",
        `Invalid element type: ${elemType}`
      );
      return null;
    }
    if (typeof val !== "string" && typeof val !== "number") {
      console.warn("Invalid value for createElem:", val);
      modal.showError(
        "Element Creation Error",
        "Failed to create DOM element.",
        `Invalid value type: ${typeof val}`
      );
      return null;
    }
    const elem = document.createElement(elemType);
    elem.innerText = val;
    return elem;
  },
  /**
   * Filters the chord items based on the input value.
   * Hides items that do not match the search query and updates the counter of found items.
   * @param {Event} e - The input or keyup event.
   * @returns {void}
   */
  filterChords(e) {
    // Validate that filterInput exists and is an input element
    if (
      !this.elements.filterInput ||
      this.elements.filterInput.tagName !== "INPUT"
    ) {
      console.warn("Filter input element is missing or not an input");
      return;
    }

    // Validate that chordItems is a NodeList or Array
    if (
      !this.elements.chordItems ||
      typeof this.elements.chordItems.forEach !== "function"
    ) {
      console.warn("Chord items are missing or not iterable");
      return;
    }

    let counter = 0;
    // Use cached DOM elements for better performance
    let filter = this.elements.filterInput.value; // case sensitive!

    // Loop through all items and hide those that don't match the search query
    for (let index = 0; index < this.elements.chordItems.length; index++) {
      const item = this.elements.chordItems[index];
      // Type check for item and textContent
      if (!item || typeof item.textContent !== "string") continue;

      /// OLD SOLUTION - keep the code for future reference
      // counter++
      // const txtValue = this.elements.chordItems[i].textContent
      // // Note: Style calculations preserved for potential future use (responsive design, animations)
      // // Currently unused but may be needed for layout calculations or visual effects
      // // const itemStyles = this.elements.chordItems[i].currentStyle || window.getComputedStyle(this.elements.chordItems[i])
      // // const h = this.elements.chordItems[i].offsetHeight
      // // const w = this.elements.chordItems[i].offsetWidth
      // if (txtValue.indexOf(filter) > -1) {
      //   // Show chord - remove Tailwind's hidden class
      //   this.elements.chordItems[i].classList.remove('hidden')
      // } else {
      //   // If no chord is found, decrement the counter
      //   counter--
      //   // Hide chord - add Tailwind's hidden class
      //   this.elements.chordItems[i].classList.add('hidden')
      // }

      /// New solution provided by CoPilot
      if (item.textContent.indexOf(filter) > -1) {
        item.classList.remove("hidden");
        counter++;
      } else {
        item.classList.add("hidden");
      }
    }

    // Display the counter result
    if (this.elements.foundItems) {
      this.elements.foundItems.textContent = "Found " + counter + " chords.";
    }

    // Note: Event parameter 'e' preserved for potential future use (accessing event properties)
    // Currently unused but may be needed for keyboard event handling or event delegation
  },

  /**
   * Initializes the app: caches DOM elements, sets up selectors, event listeners, and stave.
   * @returns {void}
   */
  init() {
    // Cache DOM elements once during initialization for better performance
    this.elements.filterInput = document.getElementById("filterChords");
    this.elements.foundItems = document.getElementById("found-items");

    // this.clearSelectors()
    this.setupStartNotes();
    this.setupOctaves();
    this.setupChordBtns();

    // Cache chord buttons AFTER they're created by setupChordBtns()
    this.elements.chordItems = document.querySelectorAll(
      "#chord-selector button"
    );

    this.setupEventListeners();
    this.setupStave();
  },
};

/**
 *  Sound Engine
 *  Handles audio playback using Howler.js and MIDI sprites.
 *  It initializes the sound file, defines MIDI sprites, and provides methods for playing chords.
 *  Note: This module encapsulates sound functionality and error handling for audio playback.
 */
const soundEngine = {
  /**
   * Initializes the sound engine.
   * @returns {void}
   */
  init() {
    // Sprites are now defined during Howler initialization using public API
    // No need to manipulate private _sprite property
    // Play a C Major Chord (example usage)
    // sound.play('48');
    // sound.play('52');
    // sound.play('55');
    // sound.play('60');
  },
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

app.init();

// TEST CASE: Error Modal Testing
// The modal is now globally accessible as window.modal for testing
//
// Test in browser console:
// 1. modal.showError('Test Error', 'This is a test error message for development.', 'Error details: Testing error modal display')
// 2. app.state.selectedChord = 'invalid-chord-name'; app.displayChordInfo()  // Triggers real error
// 3. Uncomment line below to test automatically on page load:
// modal.showError('Auto Test', 'This error shows automatically on page load for testing.', 'Remove this line in production')

// Modal functionality
const modal = {
  // Cache modal elements for performance - eliminates repeated DOM queries
  elements: {
    acknowledgements: {
      modal: null,
      openBtn: null,
      closeBtn: null,
      content: null,
    },
    information: {
      modal: null,
      openBtn: null,
      closeBtn: null,
      content: null,
    },
    error: {
      modal: null,
      message: null,
      closeBtn: null,
      okBtn: null,
      content: null,
    },
  },

  /**
   * Initializes the modal functionality.
   * This function caches modal elements, sets up event listeners,
   * and handles global escape key events for closing modals.
   * It ensures that modals are ready for interaction and provides a smooth user experience.
   */
  init() {
    // Cache all modal elements once during initialization
    this.elements.acknowledgements.modal = document.getElementById(
      "acknowledgements-modal"
    );
    this.elements.acknowledgements.openBtn = document.getElementById(
      "acknowledgements-btn"
    );
    this.elements.acknowledgements.closeBtn =
      document.getElementById("close-modal");
    this.elements.acknowledgements.content =
      this.elements.acknowledgements.modal?.querySelector(".bg-white");

    this.elements.information.modal =
      document.getElementById("information-modal");
    this.elements.information.openBtn =
      document.getElementById("information-btn");
    this.elements.information.closeBtn =
      document.getElementById("close-info-modal");
    this.elements.information.content =
      this.elements.information.modal?.querySelector(".bg-white");

    this.elements.error.modal = document.getElementById("error-modal");
    this.elements.error.message = document.getElementById("error-message");
    this.elements.error.closeBtn = document.getElementById("close-error-modal");
    this.elements.error.okBtn = document.getElementById("error-ok-btn");
    this.elements.error.content =
      this.elements.error.modal?.querySelector(".bg-red-600");

    // Setup event listeners using cached elements
    this.setupModalEvents();

    // Global escape key handler for all modals using cached elements
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (
          this.elements.acknowledgements.modal &&
          this.elements.acknowledgements.modal.classList.contains(
            "pointer-events-auto"
          )
        ) {
          this.closeModal("acknowledgements");
        }
        if (
          this.elements.information.modal &&
          this.elements.information.modal.classList.contains(
            "pointer-events-auto"
          )
        ) {
          this.closeModal("information");
        }
        if (
          this.elements.error.modal &&
          this.elements.error.modal.classList.contains("pointer-events-auto")
        ) {
          this.closeModal("error");
        }
      }
    });
  },

  /**
   * Sets up event listeners for modal open/close buttons and click events.
   * Handles opening/closing modals, click outside to close, and accessibility features.
   * Supports multiple modal types and multiple close buttons.
   * @returns {void}
   */
  setupModalEvents() {
    // List all modal types you want to support
    const modalTypes = ["acknowledgements", "information", "error"];

    modalTypes.forEach((type) => {
      const modalEl = this.elements[type];
      if (!modalEl) return;

      // Open button
      if (modalEl.openBtn) {
        modalEl.openBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openModal(type);
        });
      }

      // Close button(s)
      if (modalEl.closeBtn) {
        modalEl.closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeModal(type);
        });
      }
      // Optional: support multiple close buttons (array)
      if (Array.isArray(modalEl.closeBtns)) {
        modalEl.closeBtns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            this.closeModal(type);
          });
        });
      }

      // Ok button (for error modal)
      if (modalEl.okBtn) {
        modalEl.okBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeModal(type);
        });
      }

      // Click outside modal content closes modal
      if (modalEl.modal) {
        modalEl.modal.addEventListener("click", (e) => {
          if (e.target === modalEl.modal) {
            this.closeModal(type);
          }
        });
      }
    });
  },

  /**
   * Opens a modal of the specified type.
   * @param {string} modalType - The type of modal to open (e.g., 'acknowledgements', 'information', 'error').
   * @returns {void}
   */
  openModal(modalType) {
    const modalEl = this.elements[modalType];

    // Error handling: Check if modalEl elements exist
    if (!modalEl || !modalEl.modal || !modalEl.content) {
      console.warn(`Modal elements not found for ${modalType}`);
      return;
    }

    // Accessibility: Set ARIA attributes and focus
    modalEl.modal.setAttribute("role", "dialog");
    modalEl.modal.setAttribute("aria-modal", "true");
    modalEl.modal.setAttribute("tabindex", "-1");
    modalEl.modal.focus();

    // Enable interaction and start animation (use a twailwindcss class)
    modalEl.modal.classList.add("pointer-events-auto");
    modalEl.modal.classList.remove("pointer-events-none");
    animateModal(modalEl.modal, modalEl.content, true);
  },

  /**
   * Closes a modal of the specified type.
   * @param {string} modalType - The type of modal to close (e.g., 'acknowledgements', 'information', 'error').
   * @returns {void}
   */
  closeModal(modalType) {
    const modalEl = this.elements[modalType];

    // Error handling: Check if modalEl elements exist
    if (!modalEl || !modalEl.modal || !modalEl.content) {
      console.warn(`Modal elements not found for ${modalType}`);
      return;
    }

    animateModal(modalEl.modal, modalEl.content, false, () => {
      modalEl.modal.classList.add("pointer-events-none");
      modalEl.modal.classList.remove("pointer-events-auto");
    });
  },

  /**
   * Show error modal with user-friendly error message
   * @param {string} title - Error title
   * @param {string} message - User-friendly error message
   * @param {string} details - Technical details (optional)
   * @returns {void}
   */
  showError(title, message, details = null) {
    if (!this.elements.error.modal || !this.elements.error.message) {
      console.warn("Error modal elements not found");
      return;
    }

    // Set error message content
    this.elements.error.message.innerHTML = `
        <h3 class="font-semibold mb-2">${title}</h3>
        <p class="mb-2">${message}</p>
        ${
          details && details.trim()
            ? `<details class="text-sm text-red-200 mt-2">
            <summary class="cursor-pointer hover:text-white">Technical Details</summary>
            <pre class="mt-1 text-xs bg-red-700 p-2 rounded">${details}</pre>
        </details>`
            : ""
        }
    `;

    // Show modal with GSAP animation (reuse existing openModal logic)
    this.elements.error.modal.classList.add("pointer-events-auto");
    this.elements.error.modal.classList.remove("pointer-events-none");
    animateModal(this.elements.error.modal, this.elements.error.content, true);
  },
};

modal.init();

// Make modal globally accessible for testing and debugging
window.modal = modal;
