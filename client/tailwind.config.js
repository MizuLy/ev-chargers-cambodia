/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7F3",
        ink: "#17231F",
        muted: "#5E6B66",
        line: "#E2E6DF",
        lagoon: "#0E7C66",
        amber: "#E08A12",
        violet: "#5B4FD6",
      },
      fontFamily: {
        belanosima: ["Belanosima", "sans-serif"],
        instrumentsans: ["Instrument Sans", "Noto Sans Khmer", "sans-serif"],
        josefinsans: ["Josefin Sans", "sans-serif"],
        notokhmer: ["Noto Sans Khmer", "sans-serif"],
        comfortaa: ["Comfortaa", "sans-serif"],
      },
    },
  },
  plugins: [],
};
