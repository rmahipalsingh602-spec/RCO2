/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#020706",
          900: "#07100d",
          850: "#0b1714",
          800: "#10201a",
          700: "#173026",
          600: "#224638"
        },
        forest: {
          500: "#28bf73",
          400: "#39d382",
          300: "#6ce8aa",
          200: "#b4ffd5"
        },
        mist: "#effff5"
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "sans-serif"]
      },
      boxShadow: {
        elevation: "0 28px 80px rgba(0, 0, 0, 0.38)"
      },
      keyframes: {
        pageIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(14px) scale(0.985)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        }
      },
      animation: {
        "page-in": "pageIn 420ms ease-out both"
      }
    }
  },
  plugins: []
};
