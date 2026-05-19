/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Sweeping shine — pairs with bg-[length:200%_100%] to slide the
        // gradient across a skeleton bar so it reads as "live" loading
        // (not just a faded box).
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: { 
          "primary": "#4B49AC",
          "secondary": "#F3797E",
          "accent": "#7DA0FA",
          "neutral": "#111827",
          "base-100": "#F9FAFB",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "light",
      "dark",
    ],
  },
}
