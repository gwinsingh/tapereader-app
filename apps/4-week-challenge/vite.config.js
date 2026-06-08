import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/4-week-challenge/",
  plugins: [react()],
  build: {
    outDir: "../../web/public/4-week-challenge",
    emptyOutDir: true,
  },
});
