module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: ["/lib/**/*", ".eslintrc.js"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": 0,
    "valid-jsdoc": 0,
    "max-len": ["warn", { code: 120 }],
  },
};
