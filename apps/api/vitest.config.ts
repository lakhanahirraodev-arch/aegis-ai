import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      include: ["src/modules/**/*.ts"],
      exclude: ["src/modules/**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@aegis/database": path.resolve(__dirname, "../../packages/database/src"),
      "@aegis/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
      "@aegis/config": path.resolve(__dirname, "../../packages/config/src"),
    },
  },
});
