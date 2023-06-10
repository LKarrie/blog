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
        'main': "url('../img/silverwolf.jpg')"
      },
      colors: {
        primary: '#FF6363',
        secondary: {
          100: '#E2E2D5',
          200: '#888883',
        }
      },
      fontFamily: {
        body: ['Nunito']
      },
      height: {
        '128': '32rem',
        '160': '40rem',
        '192': '48rem',
      },
      borderWidth: {
        '15': '15px',
      }
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
