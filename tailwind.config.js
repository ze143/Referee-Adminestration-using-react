/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#00c853',
          600: '#00b34a',
          700: '#009624',
          800: '#007a1d',
          900: '#005c16',
        },
        gold: {
          400: '#ffe57f',
          500: '#ffd700',
          600: '#f9a825',
        },
        ink: {
          700: '#2c3e50',
          800: '#1a2a3a',
          900: '#0f1724',
          950: '#0a0f18',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0f1724 0%, #1a2a3a 50%, #2c3e50 100%)',
        'gradient-brand': 'linear-gradient(135deg, #00c853, #009624)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700, #f9a825)',
      },
    },
  },
  plugins: [],
}