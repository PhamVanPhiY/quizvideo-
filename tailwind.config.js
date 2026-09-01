/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        mono: ['Fira Code', 'monospace']
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a',
        },
        quiz: {
          bg: '#0e1e38',
          card: 'rgba(255, 255, 255, 0.12)',
          cardBorder: 'rgba(255, 255, 255, 0.25)',
          correct: '#22c55e',
          correctBg: '#ffffff',
          accent: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
