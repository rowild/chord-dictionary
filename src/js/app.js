/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
 */
import { Note, Chord, ChordType } from "tonal";
import { modal } from "./ui/modal.js";
import { setupStave, drawNotes } from "./notation/notation.js";
import { soundEngine } from "./sound/soundEngine.js";
import { debounce } from "./utils/helpers.js";
import { createElem } from "./utils/helpers.js";
import { START_NOTES, OCTAVES } from "./constants.js";

// Important containers
const startNoteSelector = document.getElementById("note-selector");
const octaveSelector = document.getElementById("octave-selector");
const chordSelector = document.getElementById("chord-selector");
const chosenRootNoteElem = document.getElementById("chosen-root-note");
const chosenChordElem = document.getElementById("chosen-chord");
const chordResultElem = document.getElementById("chord-result");
const notesResultElem = document.getElementById("notes-result");
const notatedResultElem = document.getElementById("notated-result");
const inputField = document.getElementById("filter-chords");

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
    START_NOTES.forEach((note) => {
      if (typeof note === "string") {
        const noteBtn = createElem("button", note);
        noteBtn.classList.add("note-selector-btn");
        startNoteSelector.append(noteBtn);
      } else {
        const enharmonicContainer = document.createElement("div");
        enharmonicContainer.classList.add("flex");
        note.forEach((enharmonicNote) => {
          const enharmonicNoteNameOption = createElem("button", enharmonicNote);
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
  setupOctaveBtns() {
    if (!octaveSelector) {
      console.error("octaveSelector element not found");
      // Optionally show error modal to user:
      modal.showError(
        "Octave Selector Error",
        "Octave selector is missing from the page.",
        "Element with id 'octave-selector' not found."
      );
      return;
    }
    // create buttons and add them to their respective containers
    OCTAVES.forEach((index) => {
      const octaveBtn = createElem("button", index);
      octaveBtn.classList.add("octave-selector-btn");
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
      console.error("chordSelector element not found");
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
      const chordBtn = createElem("button", entry.aliases[0]);
      chordBtn.classList.add("chord-selector-btn");
      chordSelector.append(chordBtn);
    });
    // Note: chordEntry variable preserved for potential future use (e.g., debugging, chord metadata)
    // Currently unused but may be needed for chord type analysis or logging
  },

  /**
   * Updates the displayed chosen root note and chord.
   * @returns {void}
   */
  updateChosenRootNoteElem() {
    chosenRootNoteElem.textContent = this.state.selectedStartNote + this.state.selectedOctave;
    if (this.state.selectedChord !== null) {
      chosenChordElem.textContent = this.state.selectedChord;
    }
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
      drawNotes(transposedNotes, notatedResultElem);
    }
    catch (error) {
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
    this.elements.filterInput = document.getElementById("filter-chords");
    this.elements.foundItems = document.getElementById("found-items");

    // this.clearSelectors()
    this.setupStartNotes();
    this.setupOctaveBtns();
    this.setupChordBtns();

    // Cache chord buttons AFTER they're created by setupChordBtns()
    this.elements.chordItems = document.querySelectorAll(
      "#chord-selector button"
    );

    this.setupEventListeners();
    setupStave(notatedResultElem);
  },
};

app.init();
modal.init();
// Make modal globally accessible for testing and debugging
window.modal = modal;
