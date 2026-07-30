/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        surface: "#131A22",
        surface2: "#1A2330",
        line: "#232D38",
        "text-primary": "#E7ECF2",
        "text-secondary": "#8B98A8",
        signal: {
          amber: "#F2A93B",
          teal: "#4FD1AE",
          red: "#FF6B5B",
          idle: "#3B4552",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(242, 169, 59, 0.35), 0 0 24px rgba(242, 169, 59, 0.25)",
        "glow-teal": "0 0 0 1px rgba(79, 209, 174, 0.35), 0 0 24px rgba(79, 209, 174, 0.2)",
      },
      keyframes: {
        flowX: {
          "0%": { left: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        flowY: {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        ping2: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        flowX: "flowX 0.7s ease-in-out forwards",
        flowY: "flowY 0.7s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
