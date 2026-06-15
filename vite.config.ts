import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// When building for GitHub Pages the app is served from /<repo>/, so assets
// must be requested from that sub-path or you get a white screen (404'd JS/CSS).
// Local dev and StackBlitz keep the default "/" base.
const base = process.env.GITHUB_PAGES ? "/meal-planner/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
