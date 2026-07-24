// Tailwind CSS configuration for the Task Manager app
// Tells Tailwind which files to scan for class names (content purging)
// and allows theme / plugin customisation.

/** @type {import('tailwindcss').Config} */
export default {
  // Content paths: Tailwind scans these files to determine which utility classes are used.
  // Unused classes are removed from the production build, keeping the CSS bundle small.
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  theme: {
    extend: {
      // Custom theme tokens (colours, spacing, etc.) can be added here.
      // Extending rather than replacing preserves all default Tailwind values.
    },
  },

  // Third-party Tailwind plugins (e.g. @tailwindcss/forms) can be registered here.
  plugins: [],
};
