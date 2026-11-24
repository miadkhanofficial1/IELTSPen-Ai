import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        surfaceSecondary: "var(--surface-secondary)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--primary-accent)",
          hover: "var(--hover-accent)",
          light: "#E31837",
          dark: "#F43F5E",
        },
        brand: {
          charcoal: "#111827",
          crimson: "#E31837",
          crimsonHover: "#BE123C",
          crimsonGlow: "rgba(227, 24, 55, 0.25)",
        },
      },
      fontFamily: {
        heading: ["var(--font-jakarta)", "system-ui", "-apple-system", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "glass-sm": "0 2px 8px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
        "glass-md": "0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
        "glass-lg": "0 20px 50px 0 rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "crimson-glow": "0 0 30px -5px rgba(227, 24, 55, 0.35)",
      },
      keyframes: {
        "drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(25px, -20px) scale(1.08)" },
        },
        "drift-reverse": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-20px, 25px) scale(0.95)" },
        },
      },
      animation: {
        "drift-crimson": "drift-slow 18s ease-in-out infinite",
        "drift-slate": "drift-reverse 22s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
