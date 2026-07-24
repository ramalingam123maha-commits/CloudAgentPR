// PostCSS configuration for the Task Manager app
// PostCSS processes CSS files through the listed plugins before they reach the browser.

export default {
  plugins: {
    // Tailwind CSS: generates utility classes from the project's tailwind.config.js
    tailwindcss: {},
    // Autoprefixer: automatically adds vendor prefixes (e.g. -webkit-) for browser compatibility
    autoprefixer: {},
  },
};
