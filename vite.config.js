import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // base: '/BP-Pull-Website/', // only add this when deploying to GitHub Pages
});
