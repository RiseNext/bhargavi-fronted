import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      // Every build directory. `NEXT_DIST_DIR` already gives the careers and
      // slider suites their own (`.next-test`, `.next-slider-test`), and both
      // were gitignored but not lint-ignored — so a lint run that happened to
      // follow an interrupted test walked thousands of generated files.
      ".next*/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // The client's old website, kept verbatim for reference only.
      "reference/**",
      ".audit/**",
    ],
  },
];

export default eslintConfig;
