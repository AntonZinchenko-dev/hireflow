import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "entities", pattern: "src/entities/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: { type: "app" }, allow: { to: { type: ["features", "entities", "shared"] } } },
            { from: { type: "features" }, allow: { to: { type: ["features", "entities", "shared"] } } },
            { from: { type: "entities" }, allow: { to: { type: "shared" } } },
            { from: { type: "shared" }, allow: { to: { type: [] } } },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma client is generated code.
    "prisma/generated/**",
  ]),
]);

export default eslintConfig;
