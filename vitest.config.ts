import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      enabled: true,
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
      include: ["src/**"],
      thresholds: {
        lines: 95,
        branches: 75,
        functions: 95,
        statements: 95,
      },
    },
  },
});
