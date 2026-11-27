import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/**/*.test.js",
        "src/**/*.test.jsx",
        "src/setupTests.js",
        "src/main.jsx",
        "src/assets/**",
      ],
    },
  },
});
