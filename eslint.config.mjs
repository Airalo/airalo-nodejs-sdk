import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: 2023,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Possible Problems
      "no-await-in-loop": "off",
      "no-promise-executor-return": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unmodified-loop-condition": "warn",

      // Best Practices
      "block-scoped-var": "error",
      "default-param-last": "error",
      "max-classes-per-file": ["error", 1],
      "no-alert": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-destructuring": ["error", { object: true, array: false }],
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
];
