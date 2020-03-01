/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
*/
import { note, transpose } from '@tonaljs/tonal'
import { chord } from '@tonaljs/chord'
import { entries } from '@tonaljs/chord-dictionary';
import { Howler, howl } from 'howler'

const startNoteSelector = document.getElementById('note-selector')
const octaveSelector = document.getElementById('octave-selector')
const chordSelector = document.getElementById('chord-selector')

const chosenRootNote = document.getElementById('chosen-root-note')
const chosenChord = document.getElementById('chosen-chord')
const chordResult = document.getElementById('chord-result')
const notesResult = document.getElementById('notes-result')

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
  clearSelectors() {
    startNoteSelector.length = 0
    octaveSelector.length = 0
  },
  updateChosenRootNote() {
    chosenRootNote.textContent = selectedStartNote + selectedOctave
    if(selectedChord !== null) {
      chosenChord.textContent = selectedChord
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
      this.updateChosenRootNote()
    })
    octaveSelector.addEventListener('click', (e) => {
      if(e.target.tagName === 'DIV') return
      selectedOctave = e.target.textContent
      this.updateChosenRootNote()
    })
    chordSelector.addEventListener('click', (e) => {
      // If we do not click on one of the enclosed buttons, but on the parent DIV, exit
      if(e.target.tagName === 'DIV') return
      selectedChord = e.target.textContent
      this.displayChordInfo()
    })
  },
  displayChordInfo() {
    const chordIntervals = chord(selectedChord).intervals
    chordResult.textContent = chordIntervals.join(' – ')

    const userCreatedRootNote = selectedStartNote + selectedOctave

    const transposedNotes = chordIntervals.map(val => {
      return transpose(userCreatedRootNote, val)
    })

    notesResult.textContent = transposedNotes.join(' – ');

    soundEngine.playResult(transposedNotes)
  },
  createElem(elemType, val) {
    const elem = document.createElement(elemType)
    elem.innerText = val
    return elem
  },
  init() {
    // this.clearSelectors()
    this.setupStartNotes()
    this.setupOctaves()
    this.setupChordBtns()
    this.setupEventListeners()
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
