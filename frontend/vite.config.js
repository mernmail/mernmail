import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';
import { join } from "node:path";
import { buildSync } from "esbuild";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      apply: "build",
      enforce: "post",
      transformIndexHtml() {
        buildSync({
          minify: true,
          bundle: true,
          
          entryPoints: [join(process.cwd(), "service-worker-build.js")],
          outfile: join(process.cwd(), "dist", "service-worker.js"),
        });
      },
    },
    legacy({
      targets: ['firefox >= 52', 'chrome >= 55', 'safari >= 11', 'edge >= 12'],
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
