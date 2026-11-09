/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-white': '#FAFAF7',
        'warm-bg': '#F7F6F2',
        'deep-navy': {
          50: '#EEF1F6',
          100: '#D6DDE8',
          200: '#ADBBD1',
          300: '#7E92B5',
          400: '#526A95',
          500: '#2E4472',
          600: '#1E3158',
          700: '#152546',
          800: '#0F1C36',
          900: '#0A1428',
        },
        'ink': {
          900: '#1C1C1E',
          700: '#3A3A3C',
          500: '#636366',
          300: '#A1A1A6',
          200: '#C7C7CC',
          100: '#E5E5EA',
          50: '#F2F2F7',
        }
      },
      fontFamily: {
        'serif': ['"Source Serif 4"', '"Source Serif Pro"', 'Georgia', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card': '0 2px 8px rgba(15, 28, 54, 0.06), 0 1px 3px rgba(15, 28, 54, 0.04)',
      },
      letterSpacing: {
        'tightserif': '-0.01em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
