// File: frontend/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'apollo-upload-client': require.resolve('apollo-upload-client/dist/upload.esm.js')
    }
  }
});
