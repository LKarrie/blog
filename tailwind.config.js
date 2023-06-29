/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ["./layouts/**/*.html"],
  theme: {
    extend: {
      textShadow: {
        sm: '0 1px 0 var(--tw-shadow-color)',
        DEFAULT: '0 4px 0 var(--tw-shadow-color)',
        lg: '0 8px 0 var(--tw-shadow-color)',
      },
      backgroundImage: {
        'main': "url('../img/silverwolf.jpg')",
        'wave': "url('../img/wave.png')",
        'weighanchor1-lazy': "url('../imglazy/weighanchor1-lazy.png')",
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
      animation: {
        tilt: 'tilt 10s infinite linear',
      },
      keyframes: {
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
  ],
}
