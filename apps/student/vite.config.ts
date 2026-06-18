import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app talks to the API **same-origin** via these proxies, so Better Auth's
// httpOnly session cookie is never cross-origin (and never exposed to JS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/v1": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  preview: { port: 4173 },
});
