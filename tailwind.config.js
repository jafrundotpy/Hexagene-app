/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hexa-deep': '#020617',
        'hexa-panel': '#0f172a',
        'hexa-card': 'rgba(30, 41, 59, 0.4)',
        'hexa-primary': '#22d3ee', // Cyan 400
        'hexa-secondary': '#818cf8', // Indigo 400
        'hexa-accent': '#f472b6', // Pink 400
        'hexa-success': '#4ade80',
        'hexa-warning': '#fbbf24',
        'hexa-danger': '#f87171',
        'hexa-muted': '#94a3b8',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hexa-gradient': 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        'blue-gradient': 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        'hexa': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(8px)' },
          '50%': { opacity: '0.8', filter: 'blur(12px)' },
        }
      }
    },
  },
  plugins: [],
}
