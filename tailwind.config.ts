import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf7f0",
        ink: "#1d1b18",
        muted: "#6b6b66",
        sage: {
          50: "#f1f5ee",
          100: "#dde6d4",
          200: "#bccdaa",
          300: "#94b27d",
          400: "#739557",
          500: "#577a40",
          600: "#446031",
          700: "#374b29",
          800: "#2c3a23",
          900: "#23301d",
        },
        rose: {
          50: "#fbf2f0",
          100: "#f4d9d3",
          200: "#e8b1a7",
          300: "#d8857a",
          400: "#c5645b",
          500: "#a94d46",
          600: "#883c37",
          700: "#6c302d",
          800: "#552825",
          900: "#42201e",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
