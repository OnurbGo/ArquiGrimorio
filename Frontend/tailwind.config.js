module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cores existentes
        bgStart: "#07070a",
        bgMid: "#0e0f14",
        bgEnd: "#141417",
        cardBg: "rgba(255,255,255,0.02)",
        purple: "#8f6bff",
        deepBlue: "#223a8a",
        teal: "#39e6b5",
        badgeText: "#dcd6ff",
        subtitle: "rgba(255,255,255,0.85)",
        sectionTitle: "#e6d9c3",
        statLabel: "#bfb4a6",

        // Novas cores de createAccount.ts
        "theme-bg": "#0b1220",
        "theme-text": "#e6eef8",
        "theme-muted": "#9ca3af",
        "theme-accent": "#7c5cff",
        "theme-danger": "#ef4444",
        "theme-success": "#22c55e",
      },
    },
  },
  plugins: [],
};
