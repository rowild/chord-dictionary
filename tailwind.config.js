module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  safelist: [
    // Classes applied to dynamically created elements that are NOT in HTML
    'display',
    'none',
    // Button classes that might be applied
    'btn',
    'button',
    // Common utility classes that might be used by JavaScript but not in HTML
    'p-1', 'p-2', 'p-4', 'p-5',
    'm-1', 'm-2', 'm-3', 'm-4', 'm-5',
    'mb-1', 'mb-4', 'mb-5',
    'mr-1', 'mr-3', 'mr-5',
    'border-gray-300',
    'bg-gray-200',
    'text-gray-600', 'text-gray-700',
    'hover:bg-gray-100', 'hover:bg-gray-200',
    'hover:text-gray-600', 'hover:text-gray-700',
  ],
  theme: {
    extend: {
      colors: {
        'black-20': 'rgba(0,0,0,.2)'
      },
      aspectRatio: {
        'none': 0,
        'square': '1 / 1',
        '16/9': '16 / 9',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '1/1': '1 / 1',
        '21/9': '21 / 9',
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
  plugins: [],
}
