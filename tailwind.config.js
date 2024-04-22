/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        '1.5xl': '1.2rem',
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
          '@apply rounded-full flex items-center justify-center text-black bg-gray-200 mb-2 transition-all duration-200 ease-in-out border-none': {},
        },
      }

      addComponents(newComponents)
    }
  ],
}