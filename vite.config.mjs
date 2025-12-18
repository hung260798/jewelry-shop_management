import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import removeConsole from "vite-plugin-remove-console";
import envCompatible from "vite-plugin-env-compatible";

export default defineConfig({
  plugins: [react(), tailwindcss(), removeConsole(), envCompatible()],
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: "/",
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      utils: path.resolve(import.meta.dirname, "./src/utils"),
      components: path.resolve(import.meta.dirname, "./src/components"),
      hooks: path.resolve(import.meta.dirname, "./src/hooks"),
    },
  },
  envPrefix: "VITE_",
});
