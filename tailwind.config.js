/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        surface: '#FFFFFF',
        border: '#F0EDE8',
        primary: '#1A1A1A',
        secondary: '#888580',
        muted: '#C0BBB5',
        'text-primary': '#1A1A1A',
        'text-secondary': '#888580',
        'text-muted': '#C0BBB5',
        'accent-gold': '#B8952A',
        'accent-gold-light': '#F5EDD6',
        error: '#D94F3D',
        success: '#2D7A4F'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
