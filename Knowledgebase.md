# Chord Player - Development Knowledgebase

## ⚠️ CRITICAL WARNINGS

### 🚨 DO NOT TOUCH CSS STYLES FOR DYNAMIC ELEMENTS
**NEVER modify or remove the CSS in `src/css/tailwind.css` that targets:**
- `#note-selector button`
- `#octave-selector button` 
- `#chord-selector button`
- Their hover states and variants

**Why:** These styles are essential for buttons created dynamically by JavaScript via `createElem()` function. Without these styles, the app becomes completely unusable and unstyled.

### 🚨 REQUIRED NODE.JS VERSION
**Use Node.js v16.x** - The project has compatibility issues with newer versions (v22+) due to Babel/preset-env conflicts.
```bash
nvm use 16
```

## Project Architecture

### Build System
- **Vite 7.0.4** - Fast development server and build tool for modern web projects
- **Tailwind CSS v4.1.11** - Modern utility-first CSS framework
- **@tailwindcss/vite** - Official Vite plugin for Tailwind CSS v4

### Key Files & Their Purpose

#### `/src/css/tailwind.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility for bg-header */
.bg-header::before { ... }

/* CRITICAL: Styles for dynamically created buttons */
#note-selector button { ... }
#octave-selector button { ... }
#chord-selector button { ... }
```
**⚠️ NEVER remove the button styles - they're required for JS-created elements!**

#### `/src/js/app.js`
- Creates buttons dynamically via `createElem('button', value)`
- Adds them to DOM containers: `#note-selector`, `#octave-selector`, `#chord-selector`
- These buttons REQUIRE the CSS styles to function properly

#### `/tailwind.config.js`
- Contains safelist for classes used by dynamic elements
- Includes custom colors (`black-20`) and aspect ratios
- Content paths: `"./src/**/*.{html,js,ts,jsx,tsx}"`

#### `/.postcssrc.json`
- PostCSS configuration in JSON format (preferred by Parcel 2)
- Only includes Tailwind CSS (autoprefixer is built into Parcel)

### Dependencies - Critical Versions
```json
{
  "dependencies": {
    "@babel/preset-env": "^7.28.0",
    "@tonaljs/modules": "^3.4.4",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "parcel": "^2.15.4",
    "postcss": "^8.5.6"
  }
}
```

## Development Workflow

### Setup Process
1. Ensure Node.js v16.x: `nvm use 16`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Clear cache if issues: `rm -rf .parcel-cache dist`

### Known Issues & Solutions

#### CSS Not Loading
**Problem:** Tailwind classes not applying
**Solution:** 
1. Check safelist in `tailwind.config.js`
2. Verify content paths include all source files
3. Clear Parcel cache: `rm -rf .parcel-cache`

#### ES6 Module Errors
**Problem:** Browser can't load modules
**Solution:** Ensure `<script>` tag has `type="module"` in `src/index.html`

#### Babel Version Conflicts
**Problem:** "Invalid Version: undefined" error
**Solution:** Use Node.js v16, not v22+

### File Structure Importance
```
src/
├── index.html          # Entry point, includes type="module"
├── css/
│   └── tailwind.css    # ⚠️ CRITICAL: Contains button styles
└── js/
    └── app.js          # Creates dynamic elements
```

## VexFlow v5.0.0 Breaking Changes

### ⚠️ CRITICAL API CHANGES (v4.x → v5.0.0)

#### Import Structure Change
**v4.x and earlier:**
```javascript
import * as Vex from 'vexflow'
const VF = Vex.Flow
```

**v5.0.0+:**
```javascript
import VexFlow from 'vexflow'
const VF = VexFlow
```

#### Method API Changes
**v4.x and earlier:**
```javascript
staveNotes[0].addAccidental(index, new VF.Accidental(acc))
```

**v5.0.0+:**
```javascript
staveNotes[0].addModifier(new VF.Accidental(acc), index)
```

#### Why These Changes Matter
- **Import change**: VexFlow v5.0.0 restructured exports to use default export pattern
- **Method change**: `addAccidental` method was replaced with more generic `addModifier` method
- **Parameter order**: Note the parameter order change in `addModifier(modifier, index)`

#### Migration Steps
1. Update import statement to use default import
2. Change VF initialization to use VexFlow directly
3. Replace all `addAccidental` calls with `addModifier`
4. Verify parameter order is correct

#### Version Compatibility
- **v1.2.93** → **v3.0.9** → **v4.2.5** → **v5.0.0**: Sequential upgrade path tested
- Each version requires careful testing of music notation rendering
- Font loading may differ between versions

## TonalJS Integration
- Fixed import: `import { all, get } from '@tonaljs/chord-type'`
- Uses `all()` instead of deprecated `entries()`
- Version 3.4.4+ fixes dim, dim7, and alt7 chord issues

## Sound Integration
- Howler.js for audio playback
- VexFlow for music notation rendering
- Custom sprite mapping for MIDI notes

## Common Maintenance Tasks

### Adding New Dynamic Button Styles
1. Add styles to `src/css/tailwind.css` targeting specific IDs
2. Use `@apply` directives for Tailwind classes
3. Test with `npm run dev`

### Updating Tailwind Classes
1. Check if classes are in HTML (auto-detected)
2. If used only in JS, add to safelist in `tailwind.config.js`
3. Rebuild with cache clear

### Troubleshooting Build Issues
1. Clear all caches: `rm -rf .parcel-cache dist node_modules/.cache`
2. Verify Node version: `node --version` (should be v16.x)
3. Check console for specific error messages
4. Ensure all imports use correct module names

## Performance Notes
- Parcel handles code splitting automatically
- CSS is processed and optimized
- Only used Tailwind classes are included in final bundle
- Custom CSS for dynamic elements is preserved

## Security Considerations
- No secrets in repository
- All dependencies are from npm
- Audio files served statically
- No server-side processing required