import { createEslintConfig } from "./tooling/eslint-rules.js";
export default createEslintConfig({
  root: import.meta.dirname,
  typedFiles: [
    "scripts/**/*.ts",
    "tooling/**/*.ts",
    "src/**/*.{ts,tsx}",
    "stories/**/*.tsx",
    ".storybook/**/*.ts",
    "*.ts",
  ],
  ignores: ["registry/**", "storybook-static/**"],
});
