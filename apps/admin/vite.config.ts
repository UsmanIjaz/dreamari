import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same-origin proxy to the API so Better Auth's session cookie stays httpOnly.
// Admin runs on its own origin (:5174), so its admin session is separate from
// the student app's (:5173).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/v1": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  preview: { port: 4174 },
});
