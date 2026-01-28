import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,
  },

  // ✅ Configuration Vitest
  test: {
    environment: "node",
    globals: true,
  },
});
