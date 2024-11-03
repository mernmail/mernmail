import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['firefox >= 52', 'chrome >= 49', 'safari >= 11', 'edge >= 12'],
      additionalLegacyPolyfills: ["unfetch/polyfill", "abortcontroller-polyfill/dist/polyfill-patch-fetch"]
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
