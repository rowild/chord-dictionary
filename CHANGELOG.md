# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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