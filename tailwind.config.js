/** @type {import('tailwindcss').Config} */

const playerHeight = "80px";
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "scrollbar-base": "#your-base-color",
        "scrollbar-light": "#your-thumb-color",
      },
      animation: {
        "scale-pulse": "scale-pulse 0.5s infinite",
      },
      boxShadow: {
        "progress-bar-blue": "-403px 0 0 400px #3B82F6", // blue-500
      },
      fontSize: {
        "1.5xl": "1.1rem",
      },
      keyframes: {
        "scale-pulse": {
          "0%, 100%": { transform: "scaleY(0.75)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      maxWidth: {
        xl: "44rem",
      },
      scale: {
        120: "1.2",
      },
      extend: {
        scrollbar: ["rounded", "dark"],
      },
      spacing: {
        "play-l-offset": "15px",
        "play-r-offset": "13px",
        player: playerHeight,
      },
      height: {
        banner: "100px",
        player: playerHeight,
        menuitem: "45px",
      },
      width: {
        144: "50rem",
        playingbar: "5px",
        menuitem: "45px",
      },
    },
  },
  variants: {
    extend: {
      display: ["checked", "group-hover"],
    },
  },
  plugins: [
    function ({ addComponents }) {
      const newComponents = {
        ".menu-item-container": {
          "@apply flex justify-center items-center h-menuitem w-menuitem text-white text-4xl rounded-md hover:bg-gray-800 p-2 mx-2 cursor-pointer":
            {},
        },
        ".menu-item-icon-container": {
          "@apply text-gray-400": {},
        },
        ".menu-item-icon-container-active": {
          "@apply scale-120": {},
        },

        ".library-item": {
          "@apply border-b border-gray-500 py-2 text-overflow": {},
        },
        ".action-round-button": {
          "@apply bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-2 rounded-full": {},
        },

        ".progress-bar": {
          "@apply appearance-none w-full h-1.5 mt-0 mb-0 block border-transparent rounded-full overflow-hidden": {},
          "&::-webkit-slider-thumb": {
            "@apply appearance-none h-1.5 w-1.5 bg-blue-500 rounded-full shadow-inner shadow-progress-bar-blue": {},
          },
          "&::-moz-range-thumb": {
            "@apply appearance-none h-1.5 w-1.5 bg-blue-500 rounded-full shadow-inner shadow-progress-bar-blue": {},
          },
        },
        ".tree-info-container": {
          "@apply text-xs text-white": {},
        },
        ".tree-info": {
          "@apply flex justify-center items-center h-full": {},
        },
        ".tree-action-container": {
          "@apply flex justify-center items-center h-full cursor-pointer": {},
          "&:hover": {
            "@apply bg-gray-500": {},
          },
        },
        ".tree-action-label-container": {
          "@apply h-full w-full flex items-center justify-start text-xs text-white": {},
        },
        ".tree-icon": {
          "@apply fill-current text-white": {},
        },

        ".player-control-button": {
          "@apply rounded-full flex items-center justify-center text-black bg-gray-200 mb-2 border-none transition-transform duration-200":
            {},
          "@apply hover:scale-105": {},
        },
        ".player-control-button-disabled": {
          "@apply rounded-full flex items-center justify-center text-black bg-gray-500 mb-2 border-none": {},
          "@apply pointer-events-none hover:scale-105": {},
        },

        ".popup-content-column": {
          "@apply flex-1 mr-2": {},
        },
        ".popup-content-column:last-child": {
          "@apply mr-0": {},
        },
        ".popup-content-label": {
          "@apply flex items-center mb-2 h-10": {},
          span: {
            "@apply mr-2": {},
          },
        },
        ".popup-content-input": {
          "@apply p-2 border border-gray-300 rounded-md mt-1 flex-grow": {},
        },
        ".popup-content-input-readonly": {
          "@apply p-2 bg-gray-200 rounded-md mt-1 h-full": {},
        },
        ".popup-content-button": {
          "@apply p-2 px-5 border-none bg-blue-500 text-white rounded-md cursor-pointer mt-5": {},
        },

        ".text-overflow": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        },
      };

      addComponents(newComponents);
    },
  ],
};
