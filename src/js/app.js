/**
 * Chord Selector
 * A javascript based tool to generate chords, using tonaljs and howler.
 * Based on the tutorial: https://www.youtube.com/watch?v=TUZe_Zxm0Ic&list=PLXAhCH9FJ8zWm17RdQFAkdsghd8aKU_dq
 */
import { Note, Chord, ChordType } from 'tonal'
import { Howl } from 'howler'
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

// Helper function to generate MIDI sprite configuration
function generateMidiSprites() {
    const sprites = {}
    const lengthOfNote = 3000
    const loopStart = 24 // MIDI number of C1; if used with A0, use 21
    let startTimeIndex = 9000 // "sound.mp3" starts with A0, so "C1" is 9000ms into the file
    
    for (let i = loopStart; i <= 108; i++) {
        // Generate sprite configuration using public API format
        sprites[i.toString()] = [startTimeIndex, lengthOfNote]
        startTimeIndex += lengthOfNote
    }
    
    return sprites
}

// Howler initialisation with sprites defined using public API
const sound = new Howl({
    src: [soundsUrl],
    sprite: generateMidiSprites(), // ✅ Use public API instead of private _sprite
    onload() {
        console.log('sound file loaded with sprites');
    },
    onloaderror(error, msg) {
        console.error('Error loading the sound file. Error:', error, '\nMessage:', msg);
        // Error handling: Show user-friendly message when audio fails to load
        const audioErrorMsg = document.createElement('div')
        audioErrorMsg.className = 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm'
        audioErrorMsg.innerHTML = '⚠️ Audio unavailable - chord visualization will work without sound'
        document.body.insertBefore(audioErrorMsg, document.body.firstChild)
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

// Global state variables moved to app object for better encapsulation

// ES6 Array methods:
// @see https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
const octaves = Array.from(new Array(8), (x, index) => index)

const app = {
    // Cache DOM elements at startup for better performance
    elements: {
        filterInput: null,
        chordItems: null,
        foundItems: null
    },

    // Application state - encapsulated within app object
    state: {
        selectedStartNote: 'C',
        selectedOctave: '1',
        selectedChord: null
    },
    /**
     * Updates the displayed chosen root note and chord.
     */
    updateChosenRootNoteElem() {
        chosenRootNoteElem.textContent = this.state.selectedStartNote + this.state.selectedOctave
        if (this.state.selectedChord !== null) {
            chosenChordElem.textContent = this.state.selectedChord
        }
    },
    /**
     * Clears the chord and note selectors.
     * Note: This function is currently unused but may be needed for future functionality.
     */
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
    /**
     * Creates buttons for each octave and adds them to the octave selector.
     * Note: Octaves are represented as numbers from 0 to 7.
     */
    setupOctaves() {
        // create buttons and add them to their respective containers
        octaves.forEach(index => {
            const octaveOption = this.createElem('button', index)
            octaveSelector.append(octaveOption)
        })
    },
    /**
     * Creates buttons for each chord type and adds them to the chord selector.
     * Note: ChordType.all() returns an array of all chord types available in tonaljs.
     */
    setupChordBtns() {
        const chordEntry = ChordType.all().map((entry, index) => {
            // 34 = dim, 38 = dim7, 96 = alt7 // fixed with version 3.4.4 or so...
            // if(index >= 34 && index <= 38 || index === 96) {
            //   console.log(index + '. entry =', entry);
            // }
            const chordBtn = this.createElem('button', entry.aliases[0])
            chordSelector.append(chordBtn)
        })
        // Note: chordEntry variable preserved for potential future use (e.g., debugging, chord metadata)
        // Currently unused but may be needed for chord type analysis or logging
    },
    /**
     * Sets up event listeners for the start note, octave, chord selectors, and input field.
     * Note: This function is responsible for handling user interactions and updating the UI accordingly.
     */
    setupEventListeners() {
        // Event delegation with proper button targeting - more robust than tagName checking
        startNoteSelector.addEventListener('click', (e) => {
            if (!e.target.matches('button')) return
            this.state.selectedStartNote = e.target.textContent
            this.updateChosenRootNoteElem()
        })
        octaveSelector.addEventListener('click', (e) => {
            if (!e.target.matches('button')) return
            this.state.selectedOctave = e.target.textContent
            this.updateChosenRootNoteElem()
        })
        chordSelector.addEventListener('click', (e) => {
            // Event delegation: only respond to button clicks, ignore container clicks
            if (!e.target.matches('button')) return
            this.state.selectedChord = e.target.textContent
            this.updateChosenRootNoteElem()
            this.displayChordInfo()
        })
        inputField.addEventListener('keyup', debounce(this.filterChords, 500))
    },
    /**
     * Displays the chord information based on the selected root note, octave, and chord type.
     * It transposes the chord intervals to the selected root note and octave, plays the sound,
     * and draws the musical notation using VexFlow.
     * Note: This function handles chord validation and error handling for invalid chords.
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
            let chordIntervals = Chord.get(this.state.selectedChord).intervals

            // Error handling: Check if chord is valid (has intervals)
            if (!chordIntervals || chordIntervals.length === 0) {
                throw new Error(`Invalid or unrecognized chord: ${this.state.selectedChord}`)
            }

            chordResultElem.textContent = chordIntervals.join(' – ')

            const userCreatedRootNote = this.state.selectedStartNote + this.state.selectedOctave
            const transposedNotes = chordIntervals.map(val => {
                const transposed = Note.transpose(userCreatedRootNote, val)
                // Error handling: Check if note transposition was successful
                if (!transposed) {
                    throw new Error(`Failed to transpose note: ${userCreatedRootNote} + ${val}`)
                }
                return transposed
            })
            notesResultElem.textContent = transposedNotes.join(' – ');

            soundEngine.playResult(transposedNotes)
            this.drawNotes(transposedNotes)

        } catch (error) {
            console.error('Error displaying chord info:', error)
            // Display user-friendly error message
            chordResultElem.textContent = 'Error: Unable to process chord'
            notesResultElem.textContent = 'Please try a different chord'
            // Show error modal to user
            modal.showError(
                'Chord Processing Error',
                'Unable to process the selected chord. Please try a different chord.',
                error.message
            )
            // Don't attempt to play sound or draw notes if chord is invalid
        }
    },
    /**
     * Sets up the VexFlow stave for musical notation rendering.
     * It initializes the renderer, context, and stave, and adds the clef based on the provided clef definition.
     * Note: This function handles default clef definitions and can be customized with specific clef parameters.
     */
    setupStave(clefDef = {}) {
        // console.log('clefDef =', clefDef);
        renderer = new VF.Renderer(notatedResultElem, VF.Renderer.Backends.SVG)
        renderer.resize(280, 240) // 224 = w-56 (14rem) = 14*16
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
    /**
     * Determines the appropriate clef configuration based on note range
     * @param {Array} notes - Array of note strings (e.g., ['C4', 'E4', 'G4'])
     * @returns {Object} - Clef configuration {clefType, clefSize, clefAnnotation}
     */
    determineClef(notes) {
        // Use Tonal's Note.octave() for reliable parsing of note strings
        // This handles double-digit octaves and complex accidentals properly
        let lowestNoteInChord = Note.octave(notes[0])
        let highestNoteInChord = Note.octave(notes[notes.length - 1])

        // Error handling: Validate octave extraction
        if (lowestNoteInChord === null || lowestNoteInChord === undefined || 
            highestNoteInChord === null || highestNoteInChord === undefined) {
            throw new Error(`Unable to determine octave from note strings: ${notes[0]} - ${notes[notes.length - 1]}`)
        }

        let clefType = 'treble'
        let clefSize = 'default' // "default" or "small"
        let clefAnnotation = undefined // ottava symbol

        // Clef selection logic based on note range
        if (lowestNoteInChord > 5 || highestNoteInChord > 6) {
            clefAnnotation = '8va'
        } else if (highestNoteInChord >= 2 && highestNoteInChord < 4) {
            clefType = 'bass'
        } else if (highestNoteInChord < 2) {
            clefType = 'bass'
            clefAnnotation = '8vb'
        }

        return { clefType, clefSize, clefAnnotation }
    },

    /**
     * Draws musical notation for the given notes using VexFlow.
     * It calculates the clef based on the lowest and highest notes, collects accidentals,
     * and formats the notes for VexFlow rendering.
     * Note: This function handles errors related to note format and clef calculation.
     */
    drawNotes(notes) {
        try {
            // Error handling: Validate input notes
            if (!notes || notes.length === 0) {
                throw new Error('No notes provided for notation')
            }

            // Use helper function to determine clef configuration
            const clefDef = this.determineClef(notes)

            // Re-draw the canvas
            if (context && context.svg && context.svg.childNodes) {
                notatedResultElem.removeChild(context.svg)
                this.setupStave(clefDef)
            }

            // "Collect" accidentals
            let vexAccidentals = []

            // "Collect" VexFlow-readable notes, transposed, if clef has annotation
            let vexNotes = notes.map(n => {
                if (!n || typeof n !== 'string') {
                    throw new Error(`Invalid note format: ${n}`)
                }

                let note = n.slice(0, -1).toLowerCase()
                let register = n.slice(-1)

                // Error handling: Validate note components
                if (!note || !register) {
                    throw new Error(`Unable to parse note: ${n}`)
                }

                // Transpose notes, if the clef received an annotation
                if (clefDef.clefAnnotation === '8vb') {
                    register = parseInt(register) + 1
                }
                if (clefDef.clefAnnotation === '8va') {
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
                    clef: clefDef.clefType,
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
        }
        catch (error) {
            console.error('Error drawing musical notation:', error)
            // Clear the notation area and show error message
            if (notatedResultElem) {
                notatedResultElem.innerHTML = '<div class="p-4 text-red-600 text-sm">Unable to display notation</div>'
            }
            // Show error modal to user
            modal.showError(
                'Notation Display Error',
                'Unable to display musical notation for this chord. The chord information is still available above.',
                error.message
            )
        }
    },
    /**
   * Creates a DOM element of the specified type with the given text value.
     */
    createElem(elemType, val) {
        const elem = document.createElement(elemType)
        elem.innerText = val
        return elem
    },
    /**
     * Filters the chord items based on the input value.
     * It hides items that do not match the search query and updates the counter of found items.
     * Note: This function uses cached DOM elements for better performance and handles case-sensitive filtering.
     */
    filterChords(e) {
        // Declare variables
        let i = 0
        let counter = 0

        // Use cached DOM elements for better performance
        let filter = this.elements.filterInput.value // case sensitive!

        // Loop through all items and hide those that don't match the search query
        for (i = 0; i < this.elements.chordItems.length; i++) {
            counter++

            const txtValue = this.elements.chordItems[i].textContent
            // Note: Style calculations preserved for potential future use (responsive design, animations)
            // Currently unused but may be needed for layout calculations or visual effects
            // const itemStyles = this.elements.chordItems[i].currentStyle || window.getComputedStyle(this.elements.chordItems[i])
            // const h = this.elements.chordItems[i].offsetHeight
            // const w = this.elements.chordItems[i].offsetWidth

            if (txtValue.indexOf(filter) > -1) {
                // Show chord - remove Tailwind's hidden class
                this.elements.chordItems[i].classList.remove('hidden')
            } else {
                // If no chord is found, decrement the counter
                counter--
                // Hide chord - add Tailwind's hidden class
                this.elements.chordItems[i].classList.add('hidden')
            }
        }

        // Display the counter result
        this.elements.foundItems.textContent = 'Found ' + counter + ' chords.'

        // Note: Event parameter 'e' preserved for potential future use (accessing event properties)
        // Currently unused but may be needed for keyboard event handling or event delegation
    },

    init() {
        // Cache DOM elements once during initialization for better performance
        this.elements.filterInput = document.getElementById('filterChords')
        this.elements.foundItems = document.getElementById('found-items')

        // this.clearSelectors()
        this.setupStartNotes()
        this.setupOctaves()
        this.setupChordBtns()

        // Cache chord buttons AFTER they're created by setupChordBtns()
        this.elements.chordItems = document.querySelectorAll('#chord-selector button')

        this.setupEventListeners()
        this.setupStave()
    }
}

const soundEngine = {
    init() {
        // Sprites are now defined during Howler initialization using public API
        // No need to manipulate private _sprite property
        
        // Play a C Major Chord (example usage)
        // sound.play('48');
        // sound.play('52');
        // sound.play('55');
        // sound.play('60');
    },
    playResult(soundSequence) {
        try {
            // Error handling: Validate input
            if (!soundSequence || soundSequence.length === 0) {
                console.warn('No notes provided for audio playback')
                return
            }

            // Put all the MIDI nummbers in an array
            const soundSequenceMidiNumbers = soundSequence.map(noteName => {
                const midiNumber = Note.midi(noteName)
                // Error handling: Check if MIDI conversion was successful
                if (midiNumber === null || midiNumber === undefined) {
                    throw new Error(`Unable to convert note to MIDI: ${noteName}`)
                }
                return midiNumber
            })

            // Error handling: Check if sound is loaded before playing
            if (!sound || sound.state() !== 'loaded') {
                console.warn('Audio not ready for playback')
                return
            }

            // Fade out any currently playing sounds to avoid harsh audio cutoff
            // This provides a smooth transition when switching between chords
            // The fade prevents jarring audio artifacts that would occur with sound.stop()
            sound.fade(1, 0, 1000)
            sound.volume(0.2)
            soundSequenceMidiNumbers.forEach(noteMidiNumber => {
                // Error handling: Validate MIDI number is in range
                if (noteMidiNumber < 24 || noteMidiNumber > 108) {
                    console.warn(`MIDI note ${noteMidiNumber} out of range (24-108), skipping`)
                    return
                }
                sound.play(noteMidiNumber.toString())
            })

        } catch (error) {
            console.error('Error playing audio:', error)
            // Show error modal to user
            modal.showError(
                'Audio Playback Error',
                'Unable to play chord audio. The chord visualization is still available.',
                error.message
            )
        }
    }
}

app.init()

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
            content: null
        },
        information: {
            modal: null,
            openBtn: null,
            closeBtn: null,
            content: null
        },
        error: {
            modal: null,
            message: null,
            closeBtn: null,
            okBtn: null,
            content: null
        }
    },
    
    init() {
        // Cache all modal elements once during initialization
        this.elements.acknowledgements.modal = document.getElementById('acknowledgements-modal')
        this.elements.acknowledgements.openBtn = document.getElementById('acknowledgements-btn')
        this.elements.acknowledgements.closeBtn = document.getElementById('close-modal')
        this.elements.acknowledgements.content = this.elements.acknowledgements.modal?.querySelector('.bg-white')
        
        this.elements.information.modal = document.getElementById('information-modal')
        this.elements.information.openBtn = document.getElementById('information-btn')
        this.elements.information.closeBtn = document.getElementById('close-info-modal')
        this.elements.information.content = this.elements.information.modal?.querySelector('.bg-white')
        
        this.elements.error.modal = document.getElementById('error-modal')
        this.elements.error.message = document.getElementById('error-message')
        this.elements.error.closeBtn = document.getElementById('close-error-modal')
        this.elements.error.okBtn = document.getElementById('error-ok-btn')
        this.elements.error.content = this.elements.error.modal?.querySelector('.bg-red-600')
        
        // Setup event listeners using cached elements
        this.setupModalEvents()
        
        // Global escape key handler for all modals using cached elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.acknowledgements.modal && this.elements.acknowledgements.modal.style.pointerEvents !== 'none') {
                    this.closeModal('acknowledgements')
                }
                if (this.elements.information.modal && this.elements.information.modal.style.pointerEvents !== 'none') {
                    this.closeModal('information')
                }
                if (this.elements.error.modal && this.elements.error.modal.style.pointerEvents !== 'none') {
                    this.closeModal('error')
                }
            }
        })
    },

    // Setup modal event listeners using cached elements
    setupModalEvents() {
        // Acknowledgements modal events
        if (this.elements.acknowledgements.openBtn) {
            this.elements.acknowledgements.openBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.openModal('acknowledgements')
            })
        }
        
        if (this.elements.acknowledgements.closeBtn) {
            this.elements.acknowledgements.closeBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.closeModal('acknowledgements')
            })
        }
        
        if (this.elements.acknowledgements.modal) {
            this.elements.acknowledgements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.acknowledgements.modal) {
                    this.closeModal('acknowledgements')
                }
            })
        }
        
        // Information modal events
        if (this.elements.information.openBtn) {
            this.elements.information.openBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.openModal('information')
            })
        }
        
        if (this.elements.information.closeBtn) {
            this.elements.information.closeBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.closeModal('information')
            })
        }
        
        if (this.elements.information.modal) {
            this.elements.information.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.information.modal) {
                    this.closeModal('information')
                }
            })
        }
        
        // Error modal events
        if (this.elements.error.closeBtn) {
            this.elements.error.closeBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.closeModal('error')
            })
        }
        
        if (this.elements.error.okBtn) {
            this.elements.error.okBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.closeModal('error')
            })
        }
        
        if (this.elements.error.modal) {
            this.elements.error.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.error.modal) {
                    this.closeModal('error')
                }
            })
        }
    },

    openModal(modalType) {
        const cached = this.elements[modalType]
        
        // Error handling: Check if cached elements exist
        if (!cached || !cached.modal || !cached.content) {
            console.warn(`Modal elements not found for ${modalType}`)
            return
        }

        // Enable interaction and start animation
        cached.modal.style.pointerEvents = 'auto'

        // GSAP animation timeline
        const tl = gsap.timeline()

        tl.to(cached.modal, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        .fromTo(cached.content, {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        }, "-=0.1")
    },

    closeModal(modalType) {
        const cached = this.elements[modalType]
        
        // Error handling: Check if cached elements exist
        if (!cached || !cached.modal || !cached.content) {
            console.warn(`Modal elements not found for ${modalType}`)
            return
        }

        // GSAP animation timeline
        const tl = gsap.timeline({
            onComplete: () => {
                cached.modal.style.pointerEvents = 'none'
            }
        })

        tl.to(cached.content, {
            scale: 0.8,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        })
        .to(cached.modal, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "-=0.1")
    },
    
    /**
     * Show error modal with user-friendly error message
     * @param {string} title - Error title
     * @param {string} message - User-friendly error message
     * @param {string} details - Technical details (optional)
     */
    showError(title, message, details = null) {
        if (!this.elements.error.modal || !this.elements.error.message) {
            console.warn('Error modal elements not found')
            return
        }
        
        // Set error message content
        this.elements.error.message.innerHTML = `
            <h3 class="font-semibold mb-2">${title}</h3>
            <p class="mb-2">${message}</p>
            ${details ? `<details class="text-sm text-red-200 mt-2">
                <summary class="cursor-pointer hover:text-white">Technical Details</summary>
                <pre class="mt-1 text-xs bg-red-700 p-2 rounded">${details}</pre>
            </details>` : ''}
        `
        
        // Show modal with GSAP animation (reuse existing openModal logic)
        this.elements.error.modal.style.pointerEvents = 'auto'
        
        const tl = gsap.timeline()
        tl.to(this.elements.error.modal, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        .fromTo(this.elements.error.content, {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        }, "-=0.1")
    }
}

modal.init()

// Make modal globally accessible for testing and debugging
window.modal = modal
