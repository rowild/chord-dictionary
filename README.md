# Music Tools by rowild

🎵 A modernized chord visualizer with playback functionality using the latest music libraries and modern web technologies. Features interactive chord selections with audio playback and musical notation display.

**Created:** February 28, 2020 | **Updated:** July 15, 2025

## 🚀 Modern Tech Stack (2025)

### Core Libraries (Latest Versions)
- **Tonal v6.4.2** - Modern music theory library (replaces @tonaljs)
- **VexFlow v5.0.0** - Latest music notation rendering library
- **Howler.js v2.2.4** - Web audio library for sound playback

### Build System & Styling
- **Vite v7.0.4** - Fast development server with instant HMR
- **Tailwind CSS v4.1.11** - Modern utility-first CSS framework
- **GSAP v3.13.0** - Professional animation library

### Node.js Version
**COMPATIBLE: Node.js v16.x (tested up to v22.x**)
```bash
# Use Node Version Manager to switch to any compatible version
nvm use 16  # or 18, 20, 22
```

## Quick Start

### 1. Setup Environment
```bash
# Switch to compatible Node version
nvm use 16  # or 18, 20, 22

# Install dependencies
npm install
```

### 2. Development
```bash
# Start Vite development server (instant HMR)
npm run dev
# → Server: http://localhost:5173/
```

### 3. Build for Production
```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure (Modern Vite Layout)

```
├── index.html          # Main entry point (Vite requires root location)
├── src/
│   ├── css/
│   │   └── tailwind.css    # ⚠️ CRITICAL: Contains styles for dynamic buttons
│   └── js/
│       └── app.js          # Main application logic with modern imports
├── public/             # Static assets (sounds, images)
├── vite.config.js      # Vite configuration with Tailwind plugin
├── package.json        # Modern dependencies and scripts
└── Knowledgebase.md    # Comprehensive development documentation
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

### Modern Tonal v6 Imports
Use the modern import structure:
```javascript
import { Note, Chord, ChordType } from 'tonal'  // ✅ Modern v6
// NOT: import { note, chord, all } from '@tonaljs/*'  // ❌ Legacy
```

## Troubleshooting

### Common Issues

**CSS not loading / No styling:**
1. Check that `src/css/tailwind.css` contains button styles
2. Restart Vite server: `npm run dev`
3. Verify `@import "tailwindcss";` syntax in CSS

**Module import errors:**
- Ensure using modern imports: `import { Note, Chord } from 'tonal'`
- Check VexFlow import: `import VexFlow from 'vexflow'`
- Verify script tag has `type="module"`

**Dynamic buttons not styled:**
- Check that CSS contains `#note-selector button` styles
- DO NOT remove or modify these styles

### Cache Issues
If experiencing build problems:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Features

- **Interactive Chord Builder**: Select root notes, octaves, and chord types
- **Audio Playback**: Real-time chord playback using Howler.js
- **Music Notation**: VexFlow integration for standard notation display
- **Chord Filtering**: Search and filter chord structures
- **Information Modal**: Comprehensive app guide with feature explanations
- **Acknowledgements Modal**: Credits all open-source libraries with links
- **Smooth Animations**: GSAP-powered modal transitions and effects
- **Responsive Design**: Tailwind CSS for modern responsive layout

## Technical Implementation (Modern Stack)

- **Frontend**: Vanilla JavaScript with modern ES modules
- **Music Theory**: Tonal v6.4.2 with namespace imports
- **Music Notation**: VexFlow v5.0.0 with latest API
- **Audio**: Howler.js with custom sprite mapping for MIDI notes
- **Animations**: GSAP v3.13.0 for smooth modal transitions
- **Styling**: Tailwind CSS v4.1.11 with modern @import syntax
- **Build**: Vite v7.0.4 with instant HMR and optimized production builds

## Development Workflow

1. Make changes to source files
2. Vite instantly updates with HMR (no full reload needed)
3. For production builds, use `npm run build`
4. Test across different browsers for audio compatibility

## Performance Notes

- **⚡ 78% smaller**: 140 packages vs 626 in legacy version
- **🔒 Zero vulnerabilities**: Clean modern dependency tree
- **🚀 Instant HMR**: Vite's sub-second hot module replacement
- **📦 Optimized builds**: Tree-shaking and code splitting
- **🎯 Modern JS**: ES modules with better browser caching
- **✨ Smooth animations**: GSAP optimized for 60fps performance

For detailed development information and critical warnings, see `Knowledgebase.md`.

