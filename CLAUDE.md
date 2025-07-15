# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with instant HMR
npm run dev
# → Server: http://localhost:5173/

# Production build
npm run build

# Preview production build
npm run preview
```

## Build System & Tech Stack

This is a modern music chord player application built with:
- **Vite 7.0.4** - Development server and build tool
- **Tailwind CSS 4.1.11** - Utility-first CSS framework with @tailwindcss/vite plugin
- **Tonal 6.4.2** - Modern music theory library
- **VexFlow 5.0.0** - Music notation rendering
- **Howler.js 2.2.4** - Web audio with sprite-based MIDI playback
- **GSAP 3.13.0** - Animation library for modal effects

### Project Structure

```
├── index.html              # Entry point (Vite requires root location)
├── src/
│   ├── css/tailwind.css    # CRITICAL: Contains dynamic button styles
│   ├── js/app.js          # Main application with modern ES imports
│   └── assets/sounds.mp3   # Audio sprites (imported as Vite module)
├── public/sounds/          # Individual audio files (direct references)
├── vite.config.js          # Vite configuration with Tailwind plugin
```

## Code Architecture

### Core Application (`src/js/app.js`)

The application is organized into three main objects:

1. **`app`** - Main application logic
   - Manages note, octave, and chord selectors
   - Handles UI creation via `createElem()` method
   - Contains chord filtering functionality
   - Orchestrates music notation rendering

2. **`soundEngine`** - Audio playback system
   - Initializes Howler.js with MIDI sprite mapping (C1-C8, MIDI 24-108)
   - Maps 3-second audio sprites to MIDI numbers
   - Handles chord playback with fade effects

3. **`modal`** - GSAP-powered modal system
   - Information modal explaining app features
   - Acknowledgements modal crediting libraries
   - Smooth animations with scale/fade effects

### Music Theory Integration

Uses modern Tonal v6 API:
```javascript
import { Note, Chord, ChordType } from 'tonal'

// Get chord intervals
const intervals = Chord.get(selectedChord).intervals

// Transpose notes
const transposed = Note.transpose(rootNote, interval)

// Get MIDI numbers
const midiNum = Note.midi(noteName)
```

### VexFlow v5 Integration

Uses modern VexFlow API with important changes from v4:
```javascript
import VexFlow from 'vexflow'

// v5 API: addModifier replaces addAccidental
staveNotes[0].addModifier(new VF.Accidental(acc), index)
```

## CRITICAL Development Notes

### ⚠️ DO NOT MODIFY Dynamic Button CSS

The styles in `src/css/tailwind.css` for these selectors are ESSENTIAL:
- `#note-selector button`
- `#octave-selector button`
- `#chord-selector button`

These styles apply to buttons created dynamically by JavaScript. Removing them breaks the entire interface.

### ES6 Module Configuration

Ensure the script tag in `index.html` has:
```html
<script src="js/app.js" type="module" defer></script>
```

### Asset Handling in Vite

- **src/assets/**: Must be imported as modules
  ```javascript
  import soundsUrl from '../assets/sounds.mp3'
  ```
- **public/**: Can be referenced directly
  ```javascript
  '/sounds/piano.mp3'
  ```

## Common Tasks

### Adding New Chord Types
1. Tonal's `ChordType.all()` automatically provides all chord types
2. New buttons are created dynamically via `app.setupChordBtns()`
3. Ensure button styles exist in CSS

### Modifying Audio Playback
- Audio sprites are 3-second segments starting at MIDI 24 (C1)
- Modify `soundEngine.init()` for different sprite timing
- Update sprite mapping in Howler initialization

### Adding New Modals
1. Create modal HTML structure
2. Add event listeners in `modal.init()`
3. Use GSAP timeline for consistent animations
4. Support click-outside and Escape key closing

### Documentation Maintenance
Always maintain creation and update dates in README.md:
- **Created:** February 28, 2020 (from first git commit)
- **Updated:** [Current date] (update when making significant changes)

When updating versions, also update:
- **package.json**: `"version": "x.x.x"`
- **index.html**: `<sup class="text-xs">vx.x.x</sup>` next to "Chord Dictionary"
- **CHANGELOG.md**: Add new version entry

Update the "Updated" date when:
- Making major feature additions or changes
- Updating dependencies or build system
- Modifying project structure or architecture

## Dependencies Notes

- **Node.js**: Compatible with v16-22
- **Modern imports**: Use namespace imports from 'tonal', not @tonaljs
- **Howler.js**: Import only `{ Howl }` from 'howler' (not `Howler` or `howl`)
- **VexFlow v5**: Uses `addModifier()` instead of `addAccidental()`
- **Tailwind v4**: Uses modern `@import "tailwindcss"` syntax

## Troubleshooting

**CSS not loading**: Check Tailwind import syntax and restart Vite server
**Module errors**: Verify modern import syntax and `type="module"` in HTML
**Audio not playing**: Check asset import paths and Howler initialization
**Notation not rendering**: Verify VexFlow v5 API usage