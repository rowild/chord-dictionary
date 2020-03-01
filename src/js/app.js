/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
*/
import { note, transpose } from '@tonaljs/tonal'
import { chord } from '@tonaljs/chord'
import { entries } from '@tonaljs/chord-dictionary';
import { Howler, howl } from 'howler'
import { TweenMax, Power2 } from 'gsap'
import debounce from 'lodash-es/debounce'
import Vex from 'vexflow/src/index.js'

// Important containers
const startNoteSelector = document.getElementById('note-selector')
const octaveSelector = document.getElementById('octave-selector')
const chordSelector = document.getElementById('chord-selector')

const chosenRootNoteElem = document.getElementById('chosen-root-note')
const chosenChordElem = document.getElementById('chosen-chord')
const chordResultElem = document.getElementById('chord-result')
const notesResultElem = document.getElementById('notes-result')

const notatedResultElem = document.getElementById('notated-result')

const inputField = document.getElementById('filterChords')

// Howler initialisation
const sound = new Howl({
  src: ['assets/sounds.mp3'],
  onload() {
    console.log('sound file loaded');
    soundEngine.init()
  },
  onloaderror(error, msg) {
    console.log('Error loading the sound file. Error:', error, '\nMessage:', msg);
  }
})

// VexFlow initialisation
const VF = Vex.Flow
let renderer = undefined // will be defined in setupNotation()
let context = undefined
let stave = undefined

// Custom App
const startNotes = [
  ['C', 'B#'],
  ['C#', 'Db'],
  'D',
  ['D#', 'Eb'],
  ['E', 'Fb'],
  ['F', 'E#'],
  ['F#', 'Gb'],
  'G',
  ['G#', 'Ab'],
  'A',
  ['A#', 'Bb'],
  ['B', 'Cb']
]

// Once the eventlisteners are hooked up, we need some vars to save the values to
let selectedStartNote = 'C'
let selectedOctave = '1'
let selectedChord = null

// ES6 Array methods:
// @see https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
const octaves = Array.from(new Array(7), (x, index) => index + 1)

const app = {
  updateChosenRootNoteElem() {
    chosenRootNoteElem.textContent = selectedStartNote + selectedOctave
    if(selectedChord !== null) {
      chosenChordElem.textContent = selectedChord
    }
  },
  setupStartNotes() {
    startNotes.forEach(note => {
      if(typeof note === 'string') {
        const noteNameOption = this.createElem('button', note)
        startNoteSelector.append(noteNameOption)
      }
      else {
        const enharmonicContainer = document.createElement('div')
        enharmonicContainer.classList.add('flex')
        note.forEach(enharmonicNote => {
          const enharmonicNoteNameOption = this.createElem('button', enharmonicNote)
          enharmonicContainer.append(enharmonicNoteNameOption)
        })

        startNoteSelector.append(enharmonicContainer)
      }
    })
  },
  setupOctaves() {
    octaves.forEach(index => {
      const octaveOption = this.createElem('button', index)
      octaveSelector.append(octaveOption)
    })
  },
  setupChordBtns() {
    const chordEntry = entries().map(entry => {
      const chordBtn = this.createElem('button', entry.aliases[0])
      chordSelector.append(chordBtn)
    })
  },
  setupEventListeners() {
    startNoteSelector.addEventListener('click', (e) => {
      if(e.target.tagName === 'DIV') return
      selectedStartNote = e.target.textContent
      this.updateChosenRootNoteElem()
    })
    octaveSelector.addEventListener('click', (e) => {
      if(e.target.tagName === 'DIV') return
      selectedOctave = e.target.textContent
      this.updateChosenRootNoteElem()
    })
    chordSelector.addEventListener('click', (e) => {
      // If we do not click on one of the enclosed buttons, but on the parent DIV, exit
      if(e.target.tagName === 'DIV') return
      selectedChord = e.target.textContent
      this.updateChosenRootNoteElem()
      this.displayChordInfo()
    })
    inputField.addEventListener('keyup', debounce(this.filterChords, 500))
  },
  displayChordInfo() {
    const chordIntervals = chord(selectedChord).intervals
    chordResultElem.textContent = chordIntervals.join(' – ')
    const userCreatedRootNote = selectedStartNote + selectedOctave
    const transposedNotes = chordIntervals.map(val => {
      return transpose(userCreatedRootNote, val)
    })
    notesResultElem.textContent = transposedNotes.join(' – ');

    soundEngine.playResult(transposedNotes)
    this.drawNotes(transposedNotes)
  },
  setupStave(clef = 'treble') {
    renderer = new VF.Renderer(notatedResultElem, VF.Renderer.Backends.SVG)
    renderer.resize(260, 140) // 224 = w-56 (14rem) = 14*16
    context = renderer.getContext();
    stave = new VF.Stave(10,20,240)
    stave.addClef(clef)
      // .addTimeSignature('4/4')
    stave.setContext(context).draw()
  },
  drawNotes(notes) {
    // Calculate clef
    let lowestNoteInChord = parseInt(notes[0].slice(-1))
    let highestNoteInChord = parseInt(notes[notes.length - 1].slice(-1))
    let clef = (lowestNoteInChord > 2 && highestNoteInChord > 3) ? 'treble' : 'bass'

    // Re-draw the canvas
    if(context.svg.childNodes) {
      notatedResultElem.removeChild(context.svg)
      this.setupStave(clef)
    }

    let vexAccidentals = []
    let vexNotes = notes.map(n => {
      let note = n.slice(0, -1).toLowerCase()
      let register = n.slice(-1)

      // Check, if there are accidentals
      vexAccidentals.push(note.slice(1,note.length))

      // Build the not in form of "c/4"
      return note + '/' + register
    })

    // Draw notes
    let staveNotes = [
      new VF.StaveNote({ clef: clef, keys: vexNotes, duration: "w" })
    ]

    vexAccidentals.map((acc, index) => {
      if(acc === '') return
      staveNotes[0].addAccidental(index, new VF.Accidental(acc))
    })

    Vex.Flow.Formatter.FormatAndDraw(context, stave, staveNotes)
  },
  createElem(elemType, val) {
    const elem = document.createElement(elemType)
    elem.innerText = val
    return elem
  },
  filterChords (e) {
    // Declare variables
    let i, input, filter, chordItems, txtValue, counter, foundItems

    input = document.getElementById('filterChords')
    chordItems = document.querySelectorAll('#chord-selector button')
    foundItems = document.getElementById('found-items')
    filter = input.value // case sensitive!
    counter = 0

    // Loop through all items and hide those who don't match the search query
    for (i = 0; i < chordItems.length; i++) {
      counter++

      const txtValue = chordItems[i].textContent
      const itemStyles = chordItems[i].currentStyle || window.getComputedStyle(chordItems[i])
      const h = chordItems[i].offsetHeight
      const w = chordItems[i].offsetWidth

      if (txtValue.indexOf(filter) > -1) {
        TweenMax.set(chordItems[i], { display: 'block' })
      }
      else {
        // If no chord is found, decrement the counter
        counter--
        TweenMax.set(chordItems[i], { display: 'none' })
      }
    }

    // Display the counter result
    foundItems.textContent = 'Found ' + counter + ' chords.'
  },
  init() {
    // this.clearSelectors()
    this.setupStartNotes()
    this.setupOctaves()
    this.setupChordBtns()
    this.setupEventListeners()
    this.setupStave()
  }
}

const soundEngine = {
  init() {
    // Here the soundfile will be split into its sprites using milliseconds.
    // The file should rovide a new sprite every 2 seconds...
    // "pianosprites" starts at C1, while "sounds.mp3" starts with A0!!!
    // Also: C1 is MIDI number 24, 96 = C7 (A0 would be 21)
    // Call this in Howler's onload function (meaning: when sound file is loaded.)

    const lengthOfNote = 3000
    const loopStart = 24 // MIDI number of C1; if used with A0, use 21
    let startTimeIndex = 9000 // "sound.mp3" starts with A0, so "C1" is 6000ms into the file

    for(let i = loopStart; i <= 96; i++) {
      // add prites to Howler's sound object
      sound['_sprite'][i] = [startTimeIndex, lengthOfNote]
      // increment the startTimeIndex
      startTimeIndex += lengthOfNote
    }

    // Play a C Major Chord
    // sound.play('48');
    // sound.play('52');
    // sound.play('55');
    // sound.play('60');
  },
  playResult(soundSequence) {
    // Put all the MIDI nummbers in an array
    const soundSequenceMidiNumbers = soundSequence.map(noteName => {
      return note(noteName).midi
    })

    sound.fade(1, 0, 1000)
    sound.volume(0.2)
    soundSequenceMidiNumbers.forEach(noteMidiNumber => {
      sound.play(noteMidiNumber.toString())
    })
  }
}

app.init()