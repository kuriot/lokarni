// 📄 frontend/tailwind.config.js

const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        primary: "rgb(226, 242, 99)",
        border: "#2a2a2a",
        background: "#0e0e0e",
        text: "#f5f5f5",
        foreground: "#f5f5f5",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 
