import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External packages (react, next, etc.) - non-type imports
            ["^react", "^next", "^@", "^[a-z]"],
            // External packages - type imports
            ["^type react", "^type next", "^type @", "^type [a-z]"],
            // Internal app imports (@/ paths) - non-type imports
            ["^@/"],
            // Internal app imports - type imports
            ["^type @/"],
            // Relative imports (same folder or parent) - non-type imports
            ["^\\.\\.?/"],
            // Relative imports - type imports
            ["^type \\.\\.?/"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
]);

export default eslintConfig;
