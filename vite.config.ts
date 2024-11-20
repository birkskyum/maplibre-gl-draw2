export default {
  root: "debug/",
  base: "/debug/",
  server: {
    host: "0.0.0.0",
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
};
