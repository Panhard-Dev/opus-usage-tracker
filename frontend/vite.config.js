import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  root: "public",
  publicDir: false,
  resolve: {
    preserveSymlinks: false
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"]
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: [".."]
    },
    proxy: {
      "/api": { target: "http://localhost:8787", changeOrigin: true },
      "/v1": { target: "http://localhost:8787", changeOrigin: true }
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "public/index.html",
        login: "public/login.html"
      }
    }
  }
});