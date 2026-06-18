const preset = require("@dreamari/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  presets: [preset],
  // Brand colors applied via `bg-${color}` template strings can't be seen by the
  // JIT scanner, so keep the dynamic accent utilities alive explicitly.
  safelist: [
    {
      pattern:
        /(bg|text|border)-(jade|jadeDeep|green|terra|teal|yellow|yellowInk|mint|mint2|cream|ink|ink2|ink3)/,
    },
  ],
  theme: { extend: {} },
  plugins: [],
};
