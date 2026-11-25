import {
  fileURLToPath,
} from "node:url";

import {
  defineConfig,
} from "vitest/config";

const sourceDirectory =
  fileURLToPath(
    new URL(
      "./src",
      import.meta.url,
    ),
  );

export default defineConfig({
  resolve: {
    alias: {
      "@": sourceDirectory,

      // Next resolve `server-only` sozinho; fora dele o pacote não existe.
      "server-only":
        fileURLToPath(
          new URL(
            "./tests/support/server-only.ts",
            import.meta.url,
          ),
        ),
    },
  },

  test: {
    environment: "node",

    include: [
      "tests/**/*.test.ts",
    ],

    clearMocks: true,
    restoreMocks: true,
  },
});
