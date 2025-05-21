import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // เปลี่ยนเป็น backend ที่รันจริง
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/lists-service": {
        target: "http://localhost:5001", // เปลี่ยนเป็น backend ที่รันจริง
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/list-service/, ""),
      },
    },
  },
});
