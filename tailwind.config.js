/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'health-primary': '#22C55E', // Health Green
        'health-secondary': '#F97316', // Orange highlight
        'health-bg': '#FFFFFF',
        'health-surface': '#F5F7FA', // Light Gray background for sections
        'health-text': '#111827', // Dark gray/black text
        'health-muted': '#6B7280', // Muted text
        'health-border': '#E5E7EB',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'health': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'health-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'health': '1rem',
      }
    },
  },
  plugins: [],
}
