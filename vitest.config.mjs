import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["./tests/setup.js"],
    // Page fixtures are read from disk rather than imported as modules.
    forceRerunTriggers: [...configDefaults.forceRerunTriggers, "**/*.html"],
    coverage: {
      provider: "v8",
      include: ["assets/js/*.js"],
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90
      }
    }
  }
});
