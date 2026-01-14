import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000, // Changed from 5173 to avoid permission issue
    proxy: {
      "/api": {
        target: "http://localhost:4889",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:4889",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@splinetool/react-spline', '@splinetool/runtime'],
  },
});
