import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        login: fileURLToPath(new URL("./login/index.html", import.meta.url)),
        register: fileURLToPath(new URL("./register/index.html", import.meta.url)),
        explore: fileURLToPath(new URL("./explore/index.html", import.meta.url)),
        indoor: fileURLToPath(new URL("./indoor/index.html", import.meta.url)),
      },
    },
  },
});
