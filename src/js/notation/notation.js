import VexFlow from "vexflow";
import { Note } from "tonal";
import { CONSTANTS } from "../constants.js";
import { modal } from "../ui/modal.js";

/**
 * VexFlow initialisation with debug mode enabled.
 */
const VF = VexFlow;
VF.Clef.DEBUG = true;
console.log("VexFlow version:", VF.VERSION);

let renderer = undefined; // will be defined in setupNotation()
let context = undefined;
let stave = undefined;


/**
 * Sets up the VexFlow stave for musical notation rendering.
 * @param {HTMLElement} notatedResultElem - The container element for notation.
 * @param {Object} [clefDef={}] - Clef configuration object.
 */
export function setupStave(notatedResultElem, clefDef = {}) {
  if (!notatedResultElem) {
    console.warn("notatedResultElem not found");
    modal.showError(
      "Notation Error",
      "Unable to display musical notation.",
      "Element with id 'notated-result' not found."
    );
    return;
  }
  renderer = new VF.Renderer(notatedResultElem, VF.Renderer.Backends.SVG);
  renderer.resize(CONSTANTS.SVG_WIDTH, CONSTANTS.SVG_HEIGHT);
  context = renderer.getContext();
  stave = new VF.Stave(CONSTANTS.STAVE_X, CONSTANTS.STAVE_Y, CONSTANTS.STAVE_WIDTH);
  if (Object.entries(clefDef).length === 0 && clefDef.constructor === Object) {
    clefDef = {
      clefType: "treble",
      clefSize: "default",
      clefAnnotation: undefined,
    };
  }
  stave.addClef(clefDef.clefType, clefDef.clefSize, clefDef.clefAnnotation);
  stave.setContext(context).draw();
}

/**
 * Determines the appropriate clef configuration based on note range.
 * @param {Array<string>} notes - Array of note strings (e.g., ['C4', 'E4', 'G4'])
 * @returns {Object} Clef configuration {clefType, clefSize, clefAnnotation}
 */
export function determineClef(notes) {
  let lowestNoteInChord = Note.octave(notes[0]);
  let highestNoteInChord = Note.octave(notes[notes.length - 1]);
  if (
    lowestNoteInChord === null ||
    lowestNoteInChord === undefined ||
    highestNoteInChord === null ||
    highestNoteInChord === undefined
  ) {
    throw new Error(
      `Unable to determine octave from note strings: ${notes[0]} - ${notes[notes.length - 1]}`
    );
  }
  let clefType = "treble";
  let clefSize = "default";
  let clefAnnotation = undefined;
  if (lowestNoteInChord > 5 || highestNoteInChord > 6) {
    clefAnnotation = "8va";
  } else if (highestNoteInChord >= 2 && highestNoteInChord < 4) {
    clefType = "bass";
  } else if (highestNoteInChord < 2) {
    clefType = "bass";
    clefAnnotation = "8vb";
  }
  return { clefType, clefSize, clefAnnotation };
}

/**
 * Draws musical notation for the given notes using VexFlow.
 * Calculates clef, collects accidentals, and formats notes for rendering.
 * Handles errors related to note format and clef calculation.
 * @param {Array<string>} notes - Array of note strings.
 * @param {HTMLElement} notatedResultElem - The container element for notation.
 * @returns {Object} - Returns { clefDef, vexNotes, vexAccidentals }
 */
export function drawNotes(notes, notatedResultElem) {
  if (!Array.isArray(notes) || notes.length === 0) {
    console.warn("drawNotes expects a non-empty array of strings");
    modal.showError(
      "Notation Error",
      "No notes provided for notation.",
      "drawNotes was called with invalid parameters."
    );
    return null;
  }

  if (!notatedResultElem) {
    console.warn("drawNotes: notatedResultElem is missing");
    modal.showError(
      "Notation Error",
      "Notation container is missing.",
      "Element with id 'notated-result' not found."
    );
    return null;
  }

  try {
    const clefDef = determineClef(notes);

    // Re-draw the canvas
    if (context && context.svg && context.svg.childNodes) {
      notatedResultElem.removeChild(context.svg);
      setupStave(notatedResultElem, clefDef);
    } else {
      setupStave(notatedResultElem, clefDef);
    }

    // Collect accidentals and VexFlow-readable notes
    let vexAccidentals = [];
    let vexNotes = notes.map((n) => {
      if (!n || typeof n !== "string") {
        throw new Error(`Invalid note format: ${n}`);
      }
      const noteName = Note.pitchClass(n).toLowerCase();
      const octave = Note.octave(n);
      if (!noteName || octave === null || octave === undefined) {
        throw new Error(`Unable to parse note: ${n}`);
      }
      let register = octave;
      if (clefDef.clefAnnotation === "8vb") {
        register = octave + 1;
      }
      if (clefDef.clefAnnotation === "8va") {
        register = octave - 1;
      }
      let accidental = noteName.length > 1 ? noteName.slice(1) : "";
      vexAccidentals.push(accidental);
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
    // vexAccidentals.forEach((acc, index) => {
    //   if (acc === "") return;
    //   staveNotes[0].addAccidental(index, new VF.Accidental(acc));
    // });

    vexAccidentals.forEach((acc, index) => {
  if (acc === "") return;
  staveNotes[0].addModifier(new VF.Accidental(acc), index);
});

    // Render notes
    const voice = new VF.Voice({ num_beats: 1, beat_value: 1 });
    voice.addTickables(staveNotes);
    const formatter = new VF.Formatter().joinVoices([voice]).format([voice], CONSTANTS.STAVE_WIDTH - 40);
    voice.draw(context, stave);

    return { clefDef, vexNotes, vexAccidentals };
  } catch (error) {
    console.error("Error drawing notes:", error);
    modal.showError(
      "Notation Error",
      "Unable to render musical notation.",
      error.message
    );
    return null;
  }
}

