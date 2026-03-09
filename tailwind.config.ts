import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base":       "var(--bg-base)",
        "bg-surface":    "var(--bg-surface)",
        "bg-elevated":   "var(--bg-elevated)",
        "bg-border":     "var(--bg-border)",
        "text-primary":  "var(--text-primary)",
        "text-secondary":"var(--text-secondary)",
        "text-dim":      "var(--text-dim)",
        accent:          "var(--accent)",
        "accent-dim":    "var(--accent-dim)",
        green:           "var(--green)",
        amber:           "var(--amber)",
        blue:            "var(--blue)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "'Courier New'", "monospace"],
      },
      boxShadow: {
        "accent-glow":    "0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow)",
        "accent-glow-sm": "0 0 10px var(--accent-glow)",
        "accent-glow-lg": "0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px var(--accent-glow)" },
          "50%":       { boxShadow: "0 0 30px var(--accent-glow), 0 0 60px var(--accent-glow)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
