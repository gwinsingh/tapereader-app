import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        bg: "#0a0e14",
        panel: "#11161d",
        border: "#1f2630",
        muted: "#6b7785",
        text: "#d8dee9",
        accent: "#4ade80",
        danger: "#f87171",
        warn: "#fbbf24",
      },
    },
  },
  plugins: [],
} satisfies Config;
