/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layouts/**/*.html"],
  theme: {
    extend: {
      backgroundImage: {
        'main': "url('../img/Novelance_68656805_p0.jpg')"
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
  plugins: [],
}
