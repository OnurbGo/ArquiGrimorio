/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f9f9f9",
        border: "#2a2a2a",
        card: "#111111",
        "muted-foreground": "#a1a1aa",
      },
      boxShadow: {
        elevated: "0 2px 12px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
