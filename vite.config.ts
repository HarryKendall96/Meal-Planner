import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// When building for GitHub Pages the app is served from a sub-path like
// /Meal-Planner/. Using a RELATIVE base ("./") makes all asset URLs relative to
// index.html, so they resolve no matter the repo-name casing or sub-path — this
// avoids the classic Pages white screen from 404'd JS/CSS. Safe because the app
// is a single page with no client-side routing. Local dev keeps "/".
const base = process.env.GITHUB_PAGES ? "./" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
