/**
 * Production Tailwind settings for the published Music Literacy Hub.
 * The `all` media type makes existing desktop utility variants unconditional
 * without adding viewport-width breakpoints to the published stylesheet.
 */
module.exports = {
  content: [
    "./*.html",
    "./*.js",
    "./*.jsx",
    "./interactive-exams/**/*.js",
  ],
  theme: {
    screens: {
      sm: { raw: "all" },
      md: { raw: "all" },
      lg: { raw: "all" },
      xl: { raw: "all" },
      "2xl": { raw: "all" },
    },
  },
};
