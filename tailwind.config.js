/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "1.5xl": "1.1rem",
      },
      spacing: {
        "play-l-offset": "17px",
        "play-r-offset": "15px",
      },
      boxShadow: {
        "progress-bar-blue": "-403px 0 0 400px #3B82F6", // blue-500
      },
      width: {
        144: "50rem",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      const newComponents = {
        ".progress-bar": {
          "@apply appearance-none w-full h-1.5 mt-0 mb-0 block border-transparent rounded-full overflow-hidden":
            {},
          "&::-webkit-slider-thumb": {
            "@apply appearance-none h-1.5 w-1.5 bg-blue-500 rounded-full shadow-inner shadow-progress-bar-blue":
              {},
          },
          "&::-moz-range-thumb": {
            "@apply appearance-none h-1.5 w-1.5 bg-blue-500 rounded-full shadow-inner shadow-progress-bar-blue":
              {},
          },
        },
        ".tree-node-info-container": {
          "@apply text-xs text-white": {},
        },
        ".tree-node-info": {
          "@apply flex justify-center items-center h-full": {},
        },
        ".tree-node-icon-container": {
          "@apply hidden justify-center items-center cursor-pointer": {},
        },
        ".tree-node-icon": {
          "@apply fill-current text-white": {},
        },
        ".player-control-button": {
          "@apply rounded-full flex items-center justify-center text-black bg-gray-200 mb-2 border-none":
            {},
        },
        ".player-control-button-disabled": {
          "@apply rounded-full flex items-center justify-center text-black bg-gray-500 mb-2 border-none":
            {},
          "@apply pointer-events-none hover:scale-105": {},
        },
      };

      addComponents(newComponents);
    },
  ],
};
