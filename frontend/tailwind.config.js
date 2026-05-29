/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f0f0f2",
          100: "#d9d9e0",
          200: "#b3b3c1",
          300: "#8c8ca2",
          400: "#666683",
          500: "#404064",
          600: "#333350",
          700: "#26263c",
          800: "#1a1a28",
          900: "#0d0d14",
          950: "#07070a",
        },
        acid: {
          DEFAULT: "#a3ff47",
          dark: "#7acc32",
          light: "#c8ff8a",
        },
        coral: {
          DEFAULT: "#ff6b6b",
          dark: "#cc4444",
        },
        sky: {
          brand: "#47c5ff",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
