import { createEslintConfig } from "./tooling/eslint-rules.js";
export default createEslintConfig({
  root: import.meta.dirname,
  typedFiles: [
    "scripts/**/*.ts",
    "tooling/**/*.ts",
    "components/**/*.tsx",
    "*.ts",
  ],
  ignores: ["registry/**"],
});
