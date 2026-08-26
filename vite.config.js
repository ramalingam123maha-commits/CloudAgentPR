// Vite configuration for the Task Manager React app
// Uses the official @vitejs/plugin-react plugin to enable:
//   - Fast Refresh (HMR) during development
//   - JSX transform without manually importing React in every file

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Register the React plugin
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test.setup.js',
  },
});
