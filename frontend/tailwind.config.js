/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        medical: {
          blue: '#0284c7',
          light: '#f0f9ff',
          dark: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}
