import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@/components": path.resolve(import.meta.dirname, "./src/components"),
      "@/screens": path.resolve(import.meta.dirname, "./src/screens"),
      "@/assets": path.resolve(import.meta.dirname, "./src/assets"),
    },
  },
});
