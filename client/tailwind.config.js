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
        forest: {
          900: '#0F2B23',
          800: '#163D32', // Deep forest green
          700: '#214F40', // Dark green
          600: '#2C6452',
          500: '#3D806B',
          400: '#5C9E87',
          300: '#79A88C', // Fresh green
          200: '#A9C9B6',
          100: '#DDECE3', // Soft mint
          50: '#F0F6F2',
        },
        surface: {
          light: '#F7F8F3', // Warm off-white
          card: '#FFFFFF',
          dark: '#141A17',
          darkCard: '#1D2421',
          charcoal: '#252D2A',
        },
        aqi: {
          good: '#10B981',
          satisfactory: '#84CC16',
          moderate: '#F59E0B',
          poor: '#F97316',
          veryPoor: '#EF4444',
          severe: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(22, 61, 50, 0.05), 0 1px 3px -1px rgba(22, 61, 50, 0.03)',
        'card': '0 4px 20px -2px rgba(22, 61, 50, 0.06), 0 2px 6px -1px rgba(22, 61, 50, 0.03)',
        'elevated': '0 10px 30px -4px rgba(22, 61, 50, 0.10), 0 4px 10px -2px rgba(22, 61, 50, 0.04)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
