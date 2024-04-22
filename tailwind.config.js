/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
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
      }

      addComponents(newComponents)
    }
  ],
}