/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./App.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./app/**/*.{js,ts,tsx}",
    "./global.css", // Include global.css
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '16px'
      },
      colors: {
        // Light theme colors
        highlight: '#0EA5E9',
        light: {
          primary: '#ffffff', // White
          secondary: '#E2E8F0', // Light gray
          text: '#000000', // Black
          subtext: '#64748B'
        },
        // Dark theme colors
        dark: {
          primary: '#0A0A0A', // Black
          secondary: '#171717',
          darker: '#000000',
          text: '#ffffff', // White
          subtext: '#A1A1A1'
        },
      },
    },
  },
  plugins: [],
};