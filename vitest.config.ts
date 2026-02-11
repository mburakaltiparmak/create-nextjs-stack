import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test-output/**", 
      "**/templates/**"
    ],
    watch: false,
    testTimeout: 200000, // Increase global timeout for scaffolding
  },
});
