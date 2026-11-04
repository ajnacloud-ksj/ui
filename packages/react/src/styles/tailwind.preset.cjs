const theme = require("./theme.json");

const colors = (mode) =>
  Object.fromEntries([
    ...Object.entries(theme.colors).map(([name, values]) => [
      `--ajna-${name}`,
      values[mode],
    ]),
    ...Object.entries(theme.sidebarColors).map(([name, values]) => [
      `--${name}`,
      values[mode],
    ]),
  ]);

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    ({ addBase }) => {
      addBase({
        ":root": { ...colors(0), "--ajna-radius": theme.radius },
        // An attribute selector keeps dark tokens even when content has no "dark" class.
        ':root[class~="dark"]': colors(1),
      });
    },
  ],
  theme: {
    extend: {
      keyframes: {
        "ajna-progress-travel": {
          from: { transform: "translateX(-8%)" },
          to: { transform: "translateX(108%)" },
        },
        "ajna-progress-stretch": {
          "0%, 100%": { transform: "scaleX(0.08)" },
          "50%": { transform: "scaleX(0.42)" },
        },
        "ajna-progress-stretch-secondary": {
          "0%, 100%": { transform: "scaleX(0.08)" },
          "50%": { transform: "scaleX(0.28)" },
        },
        "ajna-action-bar-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "ajna-progress": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(300%)" },
        },
        "ajna-spinner-rotate": {
          to: { transform: "rotate(360deg)" },
        },
        "ajna-spinner-dash": {
          "0%": { strokeDasharray: "0 150", strokeDashoffset: "0" },
          "50%": { strokeDasharray: "42 150", strokeDashoffset: "-16" },
          "100%": { strokeDasharray: "42 150", strokeDashoffset: "-59" },
        },
        "ajna-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "ajna-progress-travel":
          "ajna-progress-travel 2.2s cubic-bezier(0.4,0,0.2,1) infinite both",
        "ajna-progress-stretch":
          "ajna-progress-stretch 2.2s cubic-bezier(0.4,0,0.2,1) infinite both",
        "ajna-progress-stretch-secondary":
          "ajna-progress-stretch-secondary 2.2s cubic-bezier(0.4,0,0.2,1) infinite both",
        "ajna-action-bar-in": "ajna-action-bar-in 150ms ease-out",
        "ajna-progress": "ajna-progress 1.5s ease-in-out infinite",
        "ajna-spinner-rotate": "ajna-spinner-rotate 2s linear infinite",
        "ajna-spinner-dash": "ajna-spinner-dash 1.5s linear infinite",
        "ajna-shimmer": "ajna-shimmer 1.5s ease-in-out infinite",
      },
      fontFamily: { ajna: ["var(--ajna-font-sans, inherit)"] },
      colors: Object.fromEntries([
        ...Object.keys(theme.colors).map((name) => [
          `ajna-${name}`,
          name === "backdrop"
            ? "hsl(var(--ajna-backdrop))"
            : `hsl(var(--ajna-${name}) / <alpha-value>)`,
        ]),
        ...Object.keys(theme.sidebarColors).map((name) => [
          `ajna-${name}`,
          `hsl(var(--${name}) / <alpha-value>)`,
        ]),
      ]),
      borderRadius: {
        "ajna-sm": "calc(var(--ajna-radius) * 0.5)",
        "ajna-md": "calc(var(--ajna-radius) * 0.75)",
        "ajna-base": "var(--ajna-radius)",
        "ajna-lg": "calc(var(--ajna-radius) * 1.5)",
      },
    },
  },
};
