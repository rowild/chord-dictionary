# Chord Player - Music Theory Tools

A chord visualizer with playback functionality using TonalJS, Howler.js, and VexFlow for music notation. Creates interactive chord selections with audio playback and musical notation display.

## ⚠️ Important Requirements

### Node.js Version
**REQUIRED: Node.js v16.x**
```bash
# Use Node Version Manager to switch
nvm use 16
```
**Note:** Newer versions (v18+, v22+) cause Babel compatibility issues with this project.

### Dependencies
- **TonalJS 3.4.4+** - Music theory library (fixes dim, dim7, alt7 chords)
- **Howler.js** - Web audio library for sound playback
- **VexFlow** - Music notation rendering
- **Parcel 2** - Modern build tool with ES6 module support
- **Tailwind CSS 3** - Utility-first CSS framework

## Quick Start

### 1. Setup Environment
```bash
# Switch to Node v16
nvm use 16

# Install dependencies
npm install
```

### 2. Development
```bash
# Start development server
npm run dev

# Clear cache if issues occur
rm -rf .parcel-cache dist
```

### 3. Build for Production
```bash
# Build CSS separately if needed
npm run build

# Development server builds automatically
npm run dev
```

## Project Structure

```
src/
├── index.html          # Main entry point (includes type="module")
├── css/
│   └── tailwind.css    # ⚠️ CRITICAL: Contains styles for dynamic buttons
├── js/
│   └── app.js          # Main application logic, creates dynamic elements
└── assets/             # Sound files and images

public/                 # Static assets (sounds, images)
tailwind.config.js      # Tailwind configuration with safelist
.postcssrc.json        # PostCSS configuration (JSON format)
```

## ⚠️ Critical Development Notes

### DO NOT MODIFY CSS for Dynamic Elements
The file `src/css/tailwind.css` contains essential styles for buttons created by JavaScript:
- `#note-selector button`
- `#octave-selector button` 
- `#chord-selector button`

**These styles are NOT optional** - removing them breaks the entire interface.

### ES6 Module Configuration
The project uses ES6 modules. Ensure the script tag in `index.html` has:
```html
<script src="js/app.js" type="module" defer></script>
```

### TonalJS Import Fix
Use the correct import for chord types:
```javascript
import { all, get } from '@tonaljs/chord-type'  // ✅ Correct
// NOT: import { entries } from '@tonaljs/chord-dictionary'  // ❌ Deprecated
```

## Troubleshooting

### Common Issues

**CSS not loading / No styling:**
1. Check that `src/css/tailwind.css` contains button styles
2. Clear Parcel cache: `rm -rf .parcel-cache`
3. Verify Tailwind safelist in `tailwind.config.js`

**"Invalid Version: undefined" error:**
- Switch to Node.js v16: `nvm use 16`

**Modules not loading:**
- Ensure script tag has `type="module"`
- Check that imports use correct module names

**Dynamic buttons not styled:**
- Check that CSS contains `#note-selector button` styles
- DO NOT remove or modify these styles

### Cache Issues
If experiencing build problems:
```bash
rm -rf .parcel-cache
rm -rf dist
rm -rf node_modules/.cache
npm run dev
```

## Features

- **Interactive Chord Builder**: Select root notes, octaves, and chord types
- **Audio Playback**: Real-time chord playback using Howler.js
- **Music Notation**: VexFlow integration for standard notation display
- **Chord Filtering**: Search and filter chord structures
- **Responsive Design**: Tailwind CSS for modern responsive layout

## Technical Implementation

- **Frontend**: Vanilla JavaScript with ES6 modules
- **Audio**: Howler.js with custom sprite mapping for MIDI notes
- **Notation**: VexFlow for SVG music notation rendering
- **Styling**: Tailwind CSS 3 with custom utilities
- **Build**: Parcel 2 for modern bundling and hot reload

## Development Workflow

1. Make changes to source files
2. Parcel automatically rebuilds and hot-reloads
3. For production builds, use `npm run build`
4. Test across different browsers for audio compatibility

## Performance Notes

- CSS is automatically optimized and unused classes removed
- Audio sprites are preloaded for better performance
- VexFlow renders lightweight SVG notation
- Parcel handles automatic code splitting

For detailed development information and critical warnings, see `Knowledgebase.md`.

