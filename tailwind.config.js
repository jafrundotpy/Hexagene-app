/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hexa-deep': '#050505',
        'hexa-panel': '#0a0b10',
        'hexa-card': 'rgba(15, 17, 26, 0.7)',
        'hexa-primary': '#00e5ff',
        'hexa-secondary': '#2979ff',
        'hexa-success': '#00e676',
        'hexa-warning': '#ff9100',
        'hexa-danger': '#ff1744',
        'hexa-muted': '#94a3b8',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hexa-gradient': 'linear-gradient(135deg, #050505 0%, #0a0b10 100%)',
        'blue-gradient': 'linear-gradient(135deg, #2979ff 0%, #00e5ff 100%)',
      },
      backdropBlur: {
        'hexa': '16px',
      }
    },
  },
  plugins: [],
}
