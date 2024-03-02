/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ["./layouts/**/*.html"],
  theme: {
    extend: {
      flex: {
        'main': '1 0 auto'
      },
      textShadow: {
        sm: '0 1px 0 var(--tw-shadow-color)',
        DEFAULT: '0 4px 0 var(--tw-shadow-color)',
        lg: '0 8px 0 var(--tw-shadow-color)',
      },
      backgroundImage: {
        'main': "url('../img/alice.webp')",
        'wave': "url('../img/wave.webp')",
        'wavedark': "url('../img/wavedark.webp')",
        'weighanchor1-lazy-old': "url('../imglazy/weighanchor1-lazy.old.webp')",
        'weighanchor1-lazy': "url('../imglazy/weighanchor1-lazy.webp')",
        'weighanchor2-lazy': "url('../imglazy/weighanchor2-lazy.webp')",
        'weighanchor3-lazy': "url('../imglazy/weighanchor3-lazy.webp')",
      },
      colors: {
        primary: '#FF6363',
        secondary: {
          100: '#E2E2D5',
          200: '#888883',
        }
      },
      fontFamily: {
        body: ['Nunito, sans-serif'],
        logo: ['logo'],
      },
      height: {
        '128': '32rem',
        '160': '40rem',
        '192': '48rem',
      },
      borderWidth: {
        '15': '15px',
      },
      borderRadius: {
        '100%': '100%',
      },
      animation: {
        tilt: 'tilt 10s infinite linear',
        spainslow: 'spain2 2.25s infinite linear',
        spainslowreverse: 'spain2-reverse 2.25s infinite linear',
      },
      keyframes: {
        spain2: {
          '0%': {
              transform: 'rotate(0)'
          },
          '100%': {
              transform: 'rotate(359deg)'
          }
        },
        'spain2-reverse': {
          '0%': {
              transform: 'rotate(0)'
          },
          '100%': {
              transform: 'rotate(-359deg)'
          }
        },
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(0.5deg)',
          },
          '75%': {
            transform: 'rotate(-0.5deg)',
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
  darkMode: 'class',
}
