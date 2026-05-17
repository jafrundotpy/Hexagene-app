/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'health-primary': '#22C55E',
        'health-secondary': '#F97316',
        'health-bg': '#FFFFFF',
        'health-surface': '#F5F7FA',
        'health-text': '#111827',
        'health-muted': '#6B7280',
        'health-border': '#E5E7EB',
        // Wearable vitals palette — matches reference images exactly
        'vitals-warm':      '#f7f4ee',
        'vitals-parchment': '#f0e6d4',
        'vitals-drift':     '#b07433',
        'vitals-steady':    '#5f7d63',
        'vitals-dark':      '#1a1a2e',
        'vitals-border':    '#c2b89f',
        'vitals-track':     '#e2e8ec',
        'vitals-fill':      '#5a7385',
        'vitals-high':      '#9a4b32',
        'vitals-bg-card':   '#f9f8f6',
        'vitals-text':      '#222222',
        'vitals-muted':     '#9ca3af',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'health':       '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
        'health-lg':    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'vitals-card':  '0 2px 16px -4px rgba(176,116,51,0.10)',
        'vitals-ring':  '0 0 40px rgba(176,116,51,0.08)',
      },
      borderRadius: {
        'health': '1rem',
      },
      maxWidth: {
        'wearable': '480px',
      },
    },
  },
  plugins: [],
}
