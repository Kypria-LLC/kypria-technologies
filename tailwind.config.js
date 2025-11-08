/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        cosmos: "#0A0E1A",
        indigoVoid: "#141B2E",
        abyssViolet: "#241A3A",
        stormBlue: "#2D4B7A",
        divineGold: "#D4AF37",
        amethyst: "#A36AE3",
        lifeteal: "#2BBBAD",
      },
      boxShadow: {
        auric: "0 0 0 1px rgba(212,175,55,.32), 0 12px 36px rgba(0,0,0,.35)",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        xs: "8px",
        sm: "13px",
        md: "21px",
        lg: "34px",
        xl: "55px",
        "2xl": "89px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        drift: "drift 20s linear infinite",
      },
      keyframes: {
        drift: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 100%" },
        },
      },
    },
  },
  plugins: [],
}
