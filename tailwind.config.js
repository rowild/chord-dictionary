module.exports = {
  theme: {
    extend: {
      colors: {
        'black-20': 'rgba(0,0,0,.2)'
      },
      aspectRatio: { // defaults to {} // Docu defines it on "theme"
        'none': 0,
        'square': [1, 1], // or 1 / 1, or simply 1
        '16/9': [16, 9],  // or 16 / 9
        '4/3': [4, 3],    // or 4 / 3
        '3/2': [3, 2],
        '1/1': [1, 1],
        '21/9': [21, 9],  // or 21 / 9
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  variants: {
    aspectRatio: ['before', 'responsive'], // defaults to ['responsive']
  },
  plugins: [
    // Deprectaed with v1.2
    // require('tailwindcss-transforms'),
    // require('tailwindcss-transitions'),
    require('tailwindcss-border-gradients'),
    require('tailwindcss-aspect-ratio'),
    require('tailwindcss-pseudo-elements'),
    function({ addUtilities }) {
      addUtilities(
        {
          '.bg-header': {
            content: '""',
            zIndex: '-1',
            height: '220px',
            width: '100%',
            background: '#000',
            position: 'absolute',
            top: '0',
          }
        },
        ['before']
      )
    }
  ],
}
