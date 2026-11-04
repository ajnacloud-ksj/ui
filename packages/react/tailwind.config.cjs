/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("./src/styles/tailwind.preset.cjs")],
  content: [
    "./src/**/*.{ts,tsx}",
    "!./src/**/*.test.{ts,tsx}",
    "!./src/**/*.spec.{ts,tsx}",
    "!./src/**/*.typecheck.{ts,tsx}",
  ],
  corePlugins: { preflight: false },
};
