import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Тесты — для чистой логики слайсов (lib/, model/): без браузера и без React.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
