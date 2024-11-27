import {defineConfig} from "vite";

export default defineConfig({
  root: ".",
  base: ".",
  server: {
    host: "localhost",
    port: 9967,
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
