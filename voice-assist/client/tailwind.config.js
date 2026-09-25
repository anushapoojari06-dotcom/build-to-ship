/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hc: {
          bg: '#000000',
          card: '#0a0a0a',
          yellow: '#FFFF00',
          yellowHover: '#E6E600',
          text: '#FFFF00',
          textMuted: '#FFFFFF',
          border: '#FFFF00',
          active: '#00FF00',
          danger: '#FF3333'
        }
      },
      fontSize: {
        'accessible-sm': '20px',
        'accessible-base': '24px',
        'accessible-lg': '28px',
        'accessible-xl': '34px',
        'accessible-2xl': '42px',
        'accessible-3xl': '54px',
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'focus-ring': '0 0 0 4px #FFFF00',
        'focus-ring-blue': '0 0 0 4px #3b82f6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
