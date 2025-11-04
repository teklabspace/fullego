/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0B0D12",
          surface: "rgba(17,17,22,0.5)",
          gold: "#F1CB68",
          goldDark: "#D6A738",
          goldAlt: "#D4AF37",
          white: "#FFFFFF",
          muted: "#FFFFFF99",
          tabInactive: "#313035",
        },
        fullego: {
          dark: "#0B0D12",
          card: "rgba(30, 30, 35, 0.6)",
          cardDark: "rgba(30, 30, 35, 0.8)",
          cardHover: "rgba(30, 30, 35, 0.95)",
          gold: "#F1CB68",
          goldHover: "#D6A738",
          goldAlt: "#D4AF37",
          border: "#2B2B30",
          borderHover: "rgba(255, 255, 255, 0.2)",
        },
      },
      boxShadow: {
        pill: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.06)",
        glow: "0 0 60px rgba(241, 203, 104, 0.5)",
      },
      borderRadius: {
        pill: "9999px",
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
      },
    },
  },
};


