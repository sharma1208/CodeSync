import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPkg from 'vite-plugin-monaco-editor';

// monacoEditorPlugin is the default export in the package
const monacoEditorPlugin = monacoEditorPkg.default;

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      // Specify languageWorkers or other options if needed
      languageWorkers: ['editorWorkerService'], // minimal worker to avoid error
    }),
  ],
});

