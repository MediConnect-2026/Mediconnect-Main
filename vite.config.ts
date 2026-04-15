import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["axios", "zustand", "zod"],
          mapbox: ["mapbox-gl"],
          charts: ["recharts"],
          pdf: ["jspdf", "jspdf-autotable", "html2canvas"],
        },
      },
    },
  },
});
