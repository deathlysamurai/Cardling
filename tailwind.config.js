/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-blue': '#AEEEEE',
        'pastel-pink': '#FFB6C1',
        'pastel-purple': '#E6E6FA',
        'light-pink': '#FF7F7F',
        'light-purple': '#D6A4E0',
      },
      keyframes: {
        'wipe-left': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' }
        },
        'wipe-down': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'top' }
        }
      },
      animation: {
        'wipe-left': 'wipe-left 1s ease-in-out forwards',
        'wipe-down': 'wipe-down 1s ease-in-out forwards'
      }
    },
  },
  plugins: [],
} 