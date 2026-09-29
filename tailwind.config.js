/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./hooks/**/*.{js,jsx,mdx}",
    "./lib/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F4F0E8",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#1F1B16",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#8B5E3C",
          light: "#F3E7DA",
        },
        muted: {
          DEFAULT: "#F0EBE1",
          foreground: "#6B6459",
        },
        success: "#2F8F5B",
        warning: "#C08A1E",
        danger: "#C24F4F",
        border: "#E6DFD3",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 27, 22, 0.04), 0 8px 24px rgba(31, 27, 22, 0.06)",
        "card-hover": "0 2px 4px rgba(31, 27, 22, 0.05), 0 16px 40px rgba(31, 27, 22, 0.10)",
        pop: "0 12px 48px rgba(31, 27, 22, 0.16)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
