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
      },
      animation: {
        shimmer: 'shimmer 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'luxury': '0 20px 60px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 30px 90px rgba(0, 0, 0, 0.12)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
