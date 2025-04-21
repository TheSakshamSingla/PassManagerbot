/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'telegram': '#0088cc',
        'telegram-dark': '#006699',
      },
    },
  },
  plugins: [],
}