import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    sourcemap: false, // disable source maps entirely in build
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false, // disables for dependencies like react.js
    }
  }
});
