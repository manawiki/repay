/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    //This will disable preflight https://tailwindcss.com/docs/preflight
    preflight: false,
  },
};
