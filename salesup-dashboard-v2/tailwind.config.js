/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#FFD700',
          teal: '#0D9488',
          black: '#000000',
        }
      },
    },
  },
  plugins: [],
};
