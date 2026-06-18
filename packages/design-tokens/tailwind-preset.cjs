/**
 * Dreamari design language — Mint Fresh · Bold Sticker.
 * One token family, two registers (expressive student / restrained admin).
 * Colors use the <alpha-value> placeholder so `bg-jade/40` style opacity works.
 * Source of truth: this preset and the package's base CSS.
 */
const INK = "oklch(0.20 0.045 162)";

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // ink scale (text + the signature outline)
        ink: "oklch(0.20 0.045 162 / <alpha-value>)",
        ink2: "oklch(0.42 0.05 160 / <alpha-value>)",
        ink3: "oklch(0.55 0.04 160 / <alpha-value>)",
        // brand
        jade: "oklch(0.57 0.13 165 / <alpha-value>)",
        jadeDeep: "oklch(0.50 0.12 162 / <alpha-value>)",
        yellow: "oklch(0.85 0.15 92 / <alpha-value>)",
        yellowInk: "oklch(0.26 0.07 92 / <alpha-value>)",
        green: "oklch(0.55 0.14 155 / <alpha-value>)",
        teal: "oklch(0.60 0.11 192 / <alpha-value>)",
        terra: "oklch(0.64 0.15 38 / <alpha-value>)",
        // surfaces
        mint: "oklch(0.92 0.06 162 / <alpha-value>)",
        mint2: "oklch(0.86 0.09 160 / <alpha-value>)",
        cream: "oklch(0.975 0.03 122 / <alpha-value>)",
        // semantic
        success: "oklch(0.55 0.14 155 / <alpha-value>)",
        warning: "oklch(0.76 0.15 72 / <alpha-value>)",
        error: "oklch(0.60 0.19 25 / <alpha-value>)",
        info: "oklch(0.62 0.13 240 / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      // Bold "Sticker" elevation — flat fills, thick outline, hard offset shadow in ink.
      boxShadow: {
        "sk-xs": `2px 2px 0 ${INK}`,
        "sk-sm": `3px 3px 0 ${INK}`,
        sk: `4px 4px 0 ${INK}`,
        "sk-lg": `6px 6px 0 ${INK}`,
        "sk-xl": `7px 7px 0 ${INK}`,
        // straight-down variants used for tappable controls
        "d-sm": `0 3px 0 ${INK}`,
        d: `0 4px 0 ${INK}`,
        "d-lg": `0 5px 0 ${INK}`,
        "d-jade": "0 4px 0 oklch(0.50 0.12 162)",
      },
    },
  },
};
