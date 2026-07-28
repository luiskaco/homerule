import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        canvas: "#0b0c10",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        accent: {
          purple: "#8b5cf6",
          pink: "#ec4899",
          emerald: "#10b981",
          amber: "#f59e0b",
          cyan: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
