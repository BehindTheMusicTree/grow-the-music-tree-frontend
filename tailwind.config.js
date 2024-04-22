/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        '1.5xl': '1.1rem',
      },
      spacing: {
        'play-l-offset': '17px',
        'play-r-offset': '15px',
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      const newComponents = {
        '.tree-node-info-container': {
          '@apply text-xs text-white': {},
        },
        '.tree-node-info': {
          '@apply flex justify-center items-center h-full': {},
        },
        '.tree-node-icon-container': {
          '@apply hidden justify-center items-center cursor-pointer': {},
        },
        '.tree-node-icon': {
          '@apply fill-current text-white': {},
        },
        '.player-control-button': {
          '@apply rounded-full flex items-center justify-center text-black bg-gray-200 mb-2 border-none': {},
        },
        '.player-control-button-disabled': {
          '@apply rounded-full flex items-center justify-center text-black bg-gray-500 mb-2 border-none': {},
          '@apply pointer-events-none hover:scale-105': {},
        },
      }

      addComponents(newComponents)
    }
  ],
}