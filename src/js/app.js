/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
 */
import { Note, Chord, ChordType } from 'tonal'
import { Howler, howl } from 'howler'
import VexFlow from 'vexflow'
import { gsap } from 'gsap'
import soundsUrl from '../assets/sounds.mp3'

// Simple native debounce function
const debounce = (callback, delay) => {
    let timeoutId = null
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => callback.apply(null, args), delay)
    }
}

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
    src: [soundsUrl],
    onload() {
        console.log('sound file loaded');
        soundEngine.init()
    },
    onloaderror(error, msg) {
        console.error('Error loading the sound file. Error:', error, '\nMessage:', msg);
    }
})

// VexFlow initialisation
const VF = VexFlow
VF.Clef.DEBUG = true
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
const octaves = Array.from(new Array(8), (x, index) => index)

const app = {
    updateChosenRootNoteElem() {
        chosenRootNoteElem.textContent = selectedStartNote + selectedOctave
        if (selectedChord !== null) {
            chosenChordElem.textContent = selectedChord
        }
    },
    setupStartNotes() {
        // create buttons and add them to their respective container
        startNotes.forEach(note => {
            if (typeof note === 'string') {
                const noteNameOption = this.createElem('button', note)
                startNoteSelector.append(noteNameOption)
            } else {
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
        // create buttons and add them to their respective containers
        octaves.forEach(index => {
            const octaveOption = this.createElem('button', index)
            octaveSelector.append(octaveOption)
        })
    },
    setupChordBtns() {
        const chordEntry = ChordType.all().map((entry, index) => {
            // 34 = dim, 38 = dim7, 96 = alt7 // fixed with version 3.4.4 or so...
            // if(index >= 34 && index <= 38 || index === 96) {
            //   console.log(index + '. entry =', entry);
            // }
            const chordBtn = this.createElem('button', entry.aliases[0])
            chordSelector.append(chordBtn)
        })
    },
    setupEventListeners() {
        startNoteSelector.addEventListener('click', (e) => {
            if (e.target.tagName === 'DIV') return
            selectedStartNote = e.target.textContent
            this.updateChosenRootNoteElem()
        })
        octaveSelector.addEventListener('click', (e) => {
            if (e.target.tagName === 'DIV') return
            selectedOctave = e.target.textContent
            this.updateChosenRootNoteElem()
        })
        chordSelector.addEventListener('click', (e) => {
            // If we do not click on one of the enclosed buttons, but on the parent DIV, exit
            if (e.target.tagName === 'DIV') return
            selectedChord = e.target.textContent
            this.updateChosenRootNoteElem()
            this.displayChordInfo()
        })
        inputField.addEventListener('keyup', debounce(this.filterChords, 500))
    },
    displayChordInfo() {
        // Workaround pre tonaljs 3.4.4, when dim, dim7 and add7 were broken
        // if(selectedChord === 'dim' || selectedChord === 'dim7') {
        //   selectedChord = '°7'
        // }

        // "alt7" causes troubles. This might affect more than just "alt7" chord,
        // since it is a check agains "emptry === true", which is the case with
        // various chords
        // let chordIntervals = null;
        // if(chord(selectedChord).empty !== true) {
        //   chordIntervals = chord(selectedChord).intervals
        // } else {
        //   chordIntervals = chordType(selectedChord).intervals
        // }

        // console.log('selectedChord =', selectedChord);
        // console.log('chord(selectedChord =', chord(selectedChord));

        let chordIntervals = Chord.get(selectedChord).intervals
        chordResultElem.textContent = chordIntervals.join(' – ')

        const userCreatedRootNote = selectedStartNote + selectedOctave
        const transposedNotes = chordIntervals.map(val => {
            return Note.transpose(userCreatedRootNote, val)
        })
        notesResultElem.textContent = transposedNotes.join(' – ');

        soundEngine.playResult(transposedNotes)
        this.drawNotes(transposedNotes)
    },
    setupStave(clefDef = {}) {
        // console.log('clefDef =', clefDef);
        renderer = new VF.Renderer(notatedResultElem, VF.Renderer.Backends.SVG)
        renderer.resize(280, 200) // 224 = w-56 (14rem) = 14*16
        context = renderer.getContext();
        stave = new VF.Stave(10, 20, 240)
        // stave.addClef(type, size, annotation)
        //   size = "default" or "small"
        //   annotation = "8va" or "8vb"; pass "undefined", if no annotation is wanted
        if (Object.entries(clefDef).length === 0 && clefDef.constructor === Object) {
            clefDef = {
                clefType: 'treble',
                clefSize: 'default',
                clefAnnotation: undefined
            }
        }
        stave.addClef(clefDef.clefType, clefDef.clefSize, clefDef.clefAnnotation)
        // .addTimeSignature('4/4')
        stave.setContext(context).draw()
    },
    drawNotes(notes) {
        // Calculate clef
        let lowestNoteInChord = parseInt(notes[0].slice(-1))
        let highestNoteInChord = parseInt(notes[notes.length - 1].slice(-1))

        let clefType = 'treble'
        let clefSize = 'default' // "default" or "small"
        let clefAnnotation = undefined // ottava symbol

        if (lowestNoteInChord > 5 || highestNoteInChord > 6) {
            clefAnnotation = '8va'
        } else if (highestNoteInChord >= 2 && highestNoteInChord < 4) {
            clefType = 'bass'
        } else if (highestNoteInChord < 2) {
            clefType = 'bass'
            clefAnnotation = '8vb'
        }

        // ES6 notation! ( ... clefType: clefType ...)
        const clefDef = { clefType, clefSize, clefAnnotation }

        // Re-draw the canvas
        if (context.svg.childNodes) {
            notatedResultElem.removeChild(context.svg)
            this.setupStave(clefDef)
        }

        // "Collect" accidentals
        let vexAccidentals = []

        // "Collect" VexFlow-readable notes, transposed, if clef has annotation
        let vexNotes = notes.map(n => {
            let note = n.slice(0, -1).toLowerCase()
            let register = n.slice(-1)

            // Transpose notes, if the clef received an annotation
            if (clefAnnotation === '8vb') {
                register = parseInt(register) + 1
            }
            if (clefAnnotation === '8va') {
                register = parseInt(register) - 1
            }

            // Check, if there are accidentals
            vexAccidentals.push(note.slice(1, note.length))

            // Build the not in form of "c/4"
            return note + '/' + register.toString()
        })

        // Draw notes
        let staveNotes = [
            new VF.StaveNote({
                clef: clefType,
                keys: vexNotes,
                duration: "w"
            })
        ]

        // Draw accidentals
        vexAccidentals.map((acc, index) => {
            if (acc === '') return
            staveNotes[0].addModifier(new VF.Accidental(acc), index)
        })

        // VexFlow helper function to format and build everything
        VF.Formatter.FormatAndDraw(context, stave, staveNotes)
    },
    createElem(elemType, val) {
        const elem = document.createElement(elemType)
        elem.innerText = val
        return elem
    },
    filterChords(e) {
        // Declare variables
        let i = 0
        let counter = 0

        let input = document.getElementById('filterChords')
        let filter = input.value // case sensitive!

        let chordItems = document.querySelectorAll('#chord-selector button')
        let foundItems = document.getElementById('found-items')

        // Loop through all items and hide those that don't match the search query
        for (i = 0; i < chordItems.length; i++) {
            counter++

            const txtValue = chordItems[i].textContent
            const itemStyles = chordItems[i].currentStyle || window.getComputedStyle(chordItems[i])
            const h = chordItems[i].offsetHeight
            const w = chordItems[i].offsetWidth

            if (txtValue.indexOf(filter) > -1) {
                chordItems[i].style.display = 'block'
            } else {
                // If no chord is found, decrement the counter
                counter--
                chordItems[i].style.display = 'none'
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
        let startTimeIndex = 9000 // "sound.mp3" starts with A0, so "C1" is 9000ms into the file

        for (let i = loopStart; i <= 108; i++) {
            // add sprites to Howler's sound object
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
            return Note.midi(noteName)
        })

        sound.fade(1, 0, 1000)
        sound.volume(0.2)
        soundSequenceMidiNumbers.forEach(noteMidiNumber => {
            sound.play(noteMidiNumber.toString())
        })
    }
}

app.init()

// Modal functionality
const modal = {
    init() {
        // Acknowledgements modal
        const ackModal = document.getElementById('acknowledgements-modal')
        const ackOpenBtn = document.getElementById('acknowledgements-btn')
        const ackCloseBtn = document.getElementById('close-modal')
        
        // Information modal
        const infoModal = document.getElementById('information-modal')
        const infoOpenBtn = document.getElementById('information-btn')
        const infoCloseBtn = document.getElementById('close-info-modal')
        
        // Open acknowledgements modal
        ackOpenBtn.addEventListener('click', (e) => {
            e.preventDefault()
            this.openModal('acknowledgements-modal')
        })
        
        // Close acknowledgements modal
        ackCloseBtn.addEventListener('click', (e) => {
            e.preventDefault()
            this.closeModal('acknowledgements-modal')
        })
        
        // Open information modal
        infoOpenBtn.addEventListener('click', (e) => {
            e.preventDefault()
            this.openModal('information-modal')
        })
        
        // Close information modal
        infoCloseBtn.addEventListener('click', (e) => {
            e.preventDefault()
            this.closeModal('information-modal')
        })
        
        // Close modals when clicking outside
        ackModal.addEventListener('click', (e) => {
            if (e.target === ackModal) {
                this.closeModal('acknowledgements-modal')
            }
        })
        
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                this.closeModal('information-modal')
            }
        })
        
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (ackModal.style.pointerEvents !== 'none') {
                    this.closeModal('acknowledgements-modal')
                }
                if (infoModal.style.pointerEvents !== 'none') {
                    this.closeModal('information-modal')
                }
            }
        })
    },
    
    openModal(modalId) {
        const modal = document.getElementById(modalId)
        const modalContent = modal.querySelector('.bg-white')
        
        // Enable interaction and start animation
        modal.style.pointerEvents = 'auto'
        
        // GSAP animation timeline
        const tl = gsap.timeline()
        
        tl.to(modal, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        .fromTo(modalContent, {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        }, "-=0.1")
    },
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId)
        const modalContent = modal.querySelector('.bg-white')
        
        // GSAP animation timeline
        const tl = gsap.timeline({
            onComplete: () => {
                modal.style.pointerEvents = 'none'
            }
        })
        
        tl.to(modalContent, {
            scale: 0.8,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        })
        .to(modal, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "-=0.1")
    }
}

modal.init()
