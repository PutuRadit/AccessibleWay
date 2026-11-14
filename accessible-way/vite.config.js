import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        cityPreview: fileURLToPath(new URL("./city-preview.html", import.meta.url)),
      },
    },
  },
});
