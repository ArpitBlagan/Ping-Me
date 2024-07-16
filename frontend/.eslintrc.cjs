module.exports = {
  parser: "@typescript-eslint/parser", // If using TypeScript
  parserOptions: {
    ecmaVersion: 2023, // or later
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended", // If using TypeScript
  ],
  plugins: ["react", "react-hooks", "@typescript-eslint"], // If using TypeScript
  rules: {
    // Add specific rules or overrides here
  },
  settings: {
    react: {
      version: "detect", // Detect React version
    },
  },
};
