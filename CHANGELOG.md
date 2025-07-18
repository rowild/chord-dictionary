# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5] - 2025-07-15

### Added
- **Sticky Footer Layout**: Implemented proper footer positioning using Flexbox
  - Footer stays at bottom of viewport on short content
  - Footer moves down naturally when content requires scrolling
  - Responsive across all screen sizes using `min-h-screen flex flex-col`
- **Active State Visual Feedback**: Added active button states for better UX
  - Active buttons display with `bg-gray-900` background and `text-gray-100` text
  - Automatic active state management when buttons are clicked
  - Initial active states set for default selections (C note, octave 1)
- **Speech Recognition Support**: Added numbered pills to chord buttons only
  - Sequential numbering from 1 to total chord count
  - Subtle grey styling (`bg-gray-700` background, `text-gray-100` text)
  - Small font size (10px) positioned in top-left corner extending beyond button borders
  - Facilitates future voice command integration

### Improved
- **Button Interaction**: Enhanced button click handling with proper active state management
  - Visual feedback shows current selections across all button types
  - Consistent styling with hover and active state interactions
- **Accessibility**: Better semantic HTML structure with proper main/footer elements
  - Improved layout structure following modern web standards
  - Enhanced keyboard and screen reader compatibility

### Fixed
- **Chord Processing Error**: Resolved issue where button text included pill numbers
  - Implemented data attribute storage for original button text
  - Clean chord name processing prevents "Invalid or unrecognized chord" errors
  - Separate handling for chord buttons (with pills) vs note/octave buttons (without pills)

## [2.0.4] - 2025-07-15

### Refactored
- **Modular Architecture**: Complete code restructuring with ES6 modules
  - Extracted constants into `src/js/constants.js` for better maintainability
  - Created `src/js/utils/helpers.js` for reusable utility functions (`debounce`, `createElem`)
  - Separated UI modal logic into `src/js/ui/modal.js`
  - Moved music notation rendering to `src/js/notation/notation.js`
  - Isolated sound engine functionality in `src/js/sound/soundEngine.js`
  - Main `app.js` now focuses on core application logic and coordination

### Improved
- **CSS Organization**: Enhanced Tailwind CSS utility classes with multi-line formatting
  - Better readability with grouped utility classes
  - Improved maintenance with consistent formatting patterns
  - Added specific hiding classes for button selectors
- **HTML Element IDs**: Updated to use kebab-case for consistency
  - Changed `filterChords` to `filter-chords` for better naming conventions
  - Improved accessibility with semantic ID naming
- **Code Quality**: Enhanced function organization and documentation
  - Better separation of concerns between modules
  - Improved error handling with centralized modal system
  - More maintainable codebase with clear module boundaries
- **Button Class System**: Added specific CSS classes for button selectors
  - `.note-selector-btn`, `.octave-selector-btn`, `.chord-selector-btn`
  - Better styling control and maintainability

### Fixed
- **Constants Duplication**: Removed duplicate constant definitions
  - Consolidated MIDI and rendering constants in single location
  - Eliminated redundant variable declarations
- **Import Organization**: Cleaner ES6 module imports
  - Reduced main file complexity with focused imports
  - Better dependency management across modules

## [2.0.3] - 2025-07-15

### Added
- **Error Modal System**: Implemented comprehensive error modal with red background
  - User-friendly error messages instead of console-only logging
  - Collapsible technical details section for debugging
  - GSAP animations consistent with existing modal system
  - Multiple close options (X button, OK button, click outside, escape key)
  - Integrated with chord processing, notation display, and audio playback errors
- **Global Modal Access**: Made modal globally accessible via `window.modal` for testing

### Improved
- **Robust Octave Parsing**: Replaced fragile string slicing with Tonal's `Note.octave()`
  - Handles double-digit octaves (e.g., "C10") correctly
  - Supports complex accidentals (e.g., "F##3")
  - More reliable than custom string manipulation
- **Howler.js Public API**: Replaced private `_sprite` property access with public API
  - Uses `sprite` property in Howler constructor for better maintainability
  - Generated sprites dynamically with `generateMidiSprites()` helper function
  - Future-proof implementation that won't break with Howler updates
- **CSS Class-based Filtering**: Replaced inline styles with Tailwind's `hidden` class
  - Better maintainability and consistency with utility-first approach
  - Improved performance with class manipulation vs inline styles
- **Modal Element Caching**: Extended DOM caching to modal system
  - Eliminated repeated DOM queries during modal interactions
  - Better performance for modal open/close operations
  - Consistent with existing caching patterns in the app

### Fixed
- **Modal Console Access**: Fixed modal not being accessible from browser console
- **Error Handling**: Enhanced error handling throughout the application
  - Chord processing errors now show user-friendly modal
  - Notation display errors provide clear feedback
  - Audio playback errors inform users without breaking flow

## [2.0.2] - 2025-07-15

### Improved
- **Code Architecture**: Extracted clef selection logic into `determineClef()` helper function
  - Improved code clarity and maintainability in `drawNotes()` function
  - Enhanced testability of clef selection logic
- **State Management**: Encapsulated global state within `app.state` object
  - Moved `selectedStartNote`, `selectedOctave`, `selectedChord` into `app.state`
  - Better organization and namespace management
- **Event Handling**: Improved event delegation with `e.target.matches('button')`
  - More robust than previous `tagName === 'DIV'` approach
  - Better accessibility and semantic targeting
- **Modal System**: Refactored modal setup to eliminate code duplication
  - Configuration-driven approach for easier maintenance
  - Generic `setupModal()` function handles all modal types
- **DOM Performance**: Implemented DOM element caching in `filterChords()`
  - Eliminates repeated DOM queries during filtering
  - Better performance for real-time search functionality

### Added
- Comprehensive error handling throughout the application
  - Chord validation in `displayChordInfo()`
  - Note format validation in `drawNotes()` and `determineClef()`
  - Audio playback error handling in `playResult()`
  - User-friendly error messages in UI
- Enhanced CLAUDE.md documentation
  - Added "NEVER DELETE CODE" guidelines
  - Added "DISTINGUISH BETWEEN SUGGESTIONS AND IMPLEMENTATION" guidelines
  - Better development workflow documentation

### Documentation
- Added detailed JSDoc comments to all functions
- Preserved unused variables with explanatory comments
- Documented audio fade logic reasoning
- Enhanced code maintainability with clear commenting

## [2.0.1] - 2025-07-15

### Fixed
- Fixed Howler.js import statement in `src/js/app.js`
  - Corrected typo: `howl` → `Howl` (capital H)
  - Removed unused `Howler` import (only `Howl` class is used)
  - Now properly follows ES6 module best practices

### Added
- Created CLAUDE.md file with comprehensive development guidance
- Added creation and update dates to README.md
- Added documentation maintenance guidelines to CLAUDE.md
- Added version display (v2.0.1) next to "Chord Dictionary" in header

### Changed
- Updated documentation date in README.md to July 15, 2025

## [2.0.0] - 2025 (Previous Release)

### Major Updates
- **Build System**: Parcel 2 → Vite 7.0.4 (faster dev server, better HMR)
- **CSS Framework**: Tailwind CSS v3.4.17 → v4.1.11 (modern syntax, better performance)
- **Music Notation**: VexFlow v1.2.93 → v5.0.0 (latest API, improved rendering)
- **Music Theory**: @tonaljs/modules v3.4.16 → tonal v6.4.2 (modern package, cleaner API)

### Performance Improvements
- ⚡ 78% dependency reduction: 626 → 134 packages
- 🔒 Zero security vulnerabilities: Clean dependency tree
- 📦 Modern ES modules: Full ESM support throughout
- 🚀 Faster development: Vite's instant HMR

### Features Added
- Information & Acknowledgements modals with GSAP animations
- Modern chord filtering with native JavaScript debounce
- Enhanced audio playback with Howler.js v2.2.4
- Responsive design with Tailwind CSS v4

---

**Note**: For detailed technical information and migration notes, see `Knowledgebase.md` and `README.md`.