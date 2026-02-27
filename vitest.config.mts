import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test-output/**",
      "**/templates/**",
    ],
    watch: false,
    testTimeout: 60_000,
    // Test organizasyonu
    reporters: ["verbose"],
    // Coverage (npm run test:coverage ile çalıştır)
    coverage: {
      provider: "v8",
      include: ["bin/**"],
      reporter: ["text", "text-summary", "json", "html"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
