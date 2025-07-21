/* frontend/postcss.config.cjs
   —— CommonJS format so PostCSS can load it under Node 22 ——
*/
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // Tailwind v4 PostCSS plugin
    autoprefixer: {},            // add vendor prefixes
  },
};
