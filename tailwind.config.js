/** @type {import('tailwindcss').Config} */
module.exports = {
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
          white: "#FFFFFF",
          muted: "#FFFFFF99",
          tabInactive: "#313035",
        },
      },
      boxShadow: {
        pill: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.06)",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
};


