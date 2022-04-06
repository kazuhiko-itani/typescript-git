module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.js"],
      parser: require.resolve("@typescript-eslint/parser"),
      parserOptions: {
        sourceType: "module",
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "no-dupe-class-members": 0,

        "spaced-comment": [
          2,
          "always",
          { line: { markers: ["/"] }, block: { balanced: true } },
        ],

        "no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars": ["error"],

        "no-array-constructor": 0,
        "@typescript-eslint/no-array-constructor": 2,

        "@typescript-eslint/adjacent-overload-signatures": 2,
        "@typescript-eslint/no-namespace": [2, { allowDeclarations: true }],
        "@typescript-eslint/prefer-namespace-keyword": 2,
        "@typescript-eslint/no-var-requires": 2,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 2,
      },
      settings: {
        node: {
          tryExtensions: [".ts", ".js", ".json", ".node"],
        },
      },
    },
  ],
};
