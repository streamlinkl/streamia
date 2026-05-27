/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        accent: '#6C63FF',
        'accent-lt': '#f0efff',
        'accent-dk': '#5a52e0',
        live: '#e63946',
        twitch: '#9146FF',
        kick: '#2ea04a',
        youtube: '#cc0000',
        bg: '#f3f2ef',
      },
    },
  },
  plugins: [],
}
