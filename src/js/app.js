// "Tonal" contains: note, interval, transpose, distance, pitch
// import { distance, note, interval, pitch, transpose } from '@tonaljs/tonal'
// import { scale } from '@tonaljs/scale'
// import { chord } from '@tonaljs/chord';
import { entries, chordType } from '@tonaljs/chord-dictionary';
// import { pcset } from '@tonaljs/pcset';

const startNoteSelector = document.getElementById('select-note')
const octaveSelector = document.getElementById('select-octave')
const chordSelector = document.getElementById('chord-selector')
const chordSelectorStyles = "shadow font-semibold text-gray-700 text-sm border border-gray-200 p-2 mr-4 mb-4 rounded bg-gray-100 hover:bg-white hover:text-black"

const startNotes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'B#']

// ES6 Array methods:
// @see https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
const octaves = Array.from(new Array(7), (x, index) => index + 1)

const app = {
  clearSelectors() {
    startNoteSelector.length = 0
    octaveSelector.length = 0
  },
  setupStartNotes() {
    startNotes.forEach(note => {
      const noteNameOption = this.createElem('option', note)
      startNoteSelector.append(noteNameOption)
    })
  },
  setupOctaves() {
    octaves.forEach(index => {
      const octaveOption = this.createElem('option', index)
      octaveSelector.append(octaveOption)
    })
  },
  setupChordBtns() {
    // const chordNames = entries()
    const chordEntry = entries().map(entry => {
      const chordBtn = this.createElem('button', entry.aliases[0], chordSelectorStyles)
      chordSelector.append(chordBtn)
    })
  },
  createElem(elemType, val, styles = '') {
    const elem = document.createElement(elemType)
    elem.value = val
    elem.innerText = val

    // if(styles !== '') {
    //   let styleArr = styles.split(' ')
    //   styleArr.forEach(cn => {
    //     elem.classList.add(cn)
    //   })
    // }

    return elem
  },
  init() {
    this.clearSelectors()
    this.setupStartNotes()
    this.setupOctaves()
    this.setupChordBtns()
  }
}

app.init()
