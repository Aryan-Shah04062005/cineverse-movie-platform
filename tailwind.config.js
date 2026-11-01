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
        background: {
          DEFAULT: '#07070b',
          light: '#f5f7fb',
          secondary: '#0f0f17',
          tertiary: '#151522',
        },
        surface: {
          DEFAULT: 'rgba(21, 21, 35, 0.75)',
          light: 'rgba(255, 255, 255, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(0, 0, 0, 0.1)',
        },
        cine: {
          red: '#ff1a53',
          crimson: '#e11d48',
          purple: '#a855f7',
          violet: '#7c3aed',
          blue: '#06b6d4',
          cyan: '#00f0ff',
          gold: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        cinematic: ['Cinzel', 'Cinzel Decorative', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 35px -5px rgba(255, 26, 83, 0.5)',
        'glow-purple': '0 0 35px -5px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 35px -5px rgba(0, 240, 255, 0.5)',
        'glow-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-shift': 'glowShift 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowShift: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
