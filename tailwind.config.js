/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.js", "./components/**/*.js"],
  theme: {
    extend: {
      colors: { deep: "#0b1a24", panel: "#11222d", line: "#22394a", mist: "#9db3c0" },
      fontFamily: { sans: ["var(--font-main)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
