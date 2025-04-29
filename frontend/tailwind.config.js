/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      'e-ride-purple': "rgb(78, 78, 74)",

      customGreen: "#22CE4DFF",
      altGreen: "#0D842AFF",
      customGray: "#1C2526",
      activeWhite: "#fFF",
      altColor:"#2F4F4F"
    },
  },
};
export const plugins = [];
