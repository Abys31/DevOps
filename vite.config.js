import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173 },

  test: {
    environment: "node",
    globals: true,

    // ✅ Vitest ne teste que dans src/**/__tests__ et ignore tests/ (Playwright)
    include: ["src/**/__tests__/**/*.test.ts", "src/**/__tests__/**/*.spec.ts"],
    exclude: ["tests/**", "node_modules/**", "dist/**"],
  },
});
