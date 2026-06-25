/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bookends-navy': '#1a2744',
        'bookends-navy-dark': '#111b33',
        'bookends-navy-light': '#243460',
        'bookends-beige': '#f5f0e8',
        'bookends-beige-dark': '#ede6d6',
        'bookends-gold': '#c9a84c',
        'bookends-gold-light': '#e8c96a',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
