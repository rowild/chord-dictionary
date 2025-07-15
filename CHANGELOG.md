# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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