/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'tactical-glow': '0 0 10px rgba(249, 115, 22, 0.5)',
        'tactical-glow-lg': '0 0 20px rgba(234, 88, 12, 0.3)',
        'tactical-glow-xl': '0 0 30px rgba(234, 88, 12, 0.5)',
        'tactical-glow-xp': '0 0 10px rgba(234, 88, 12, 0.8)',
        'tactical-glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'tactical-glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'tactical-glow-green-player': '0 0 10px rgba(34, 197, 94, 0.8)',
        'tactical-glow-ready': '0 0 30px rgba(234, 88, 12, 0.4)',
        'tactical-glow-countdown': '0 0 15px rgba(234, 88, 12, 0.8)',
        'tactical-glow-leader': '0 0 15px rgba(234, 88, 12, 0.2)',
        'tactical-glow-logo': '0 0 15px rgba(234, 88, 12, 0.5)',
      },
      dropShadow: {
        'tactical-hud': '0 0 50px rgba(255, 255, 255, 0.3)',
        'tactical-operator': '0 20px 50px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
};
