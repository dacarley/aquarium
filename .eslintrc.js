module.exports = {
  root: true,
  env: {
      node: true
  },
  overrides: [
      {
          files: [
              "**/*.spec.js", "**/*.spec.ts"
          ],
          env: {
              mocha: true
          }
      }
  ],
  plugins: [
      "switch-case"
  ],
  extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:vue/essential",
      "plugin:vue/recommended",
      "@vue/typescript"
  ],
  rules: {
      "@typescript-eslint/explicit-function-return-type": [
          "error",
          {
              allowExpressions: true
          }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      semi: [
          "error",
          "always"
      ],
      "arrow-body-style": "off",
      "class-methods-use-this": "off",
      "comma-dangle": [
          "error",
          "never"
      ],
      "consistent-return": "off",
      "default-case": "error",
      "eol-last": "error",
      "global-require": "off",
      "import/no-cycle": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-dynamic-require": "off",
      indent: "off",
      "@typescript-eslint/indent": [
          "error",
          4,
          {
              SwitchCase: 1
          }
      ],
      "key-spacing": [
          "error",
          {
              afterColon: true,
              beforeColon: false
          }
      ],
      "keyword-spacing": [
          "error",
          {
              after: true
          }
      ],
      "lines-between-class-members": [
          "error",
          "always",
          {
              exceptAfterSingleLine: true
          }
      ],
      "max-len": [
          "error",
          {
              code: 200
          }
      ],
      "new-cap": [
          "error",
          {
              capIsNew: false,
              newIsCap: true
          }
      ],
      "newline-before-return": "error",
      "no-fallthrough": "off",
      "no-multiple-empty-lines": [
          "error",
          {
              max: 1,
              maxBOF: 0,
              maxEOF: 0
          }
      ],
      "no-plusplus": "off",
      "no-restricted-syntax": "off",
      "no-shadow": "off",
      "no-underscore-dangle": "off",
      "no-undef": "error",
      "no-unused-expressions": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
          "error",
          {
              args: "all",
              argsIgnorePattern: "^_",
              vars: "local"
          }
      ],
      "no-use-before-define": [
          "error",
          {
              classes: true,
              functions: false
          }
      ],
      "object-curly-newline": [
          "error",
          {
              ObjectExpression: {
                  multiline: true,
                  minProperties: 1
              },
              ImportDeclaration: {
                  minProperties: 3
              }
          }
      ],
      "object-curly-spacing": [
          "error",
          "always"
      ],
      "object-property-newline": [
          "error",
          {
              allowAllPropertiesOnSameLine: false
          }
      ],
      "operator-linebreak": [
          "error",
          "before"
      ],
      "prefer-destructuring": "off",
      "switch-case/newline-between-switch-case": [
          "error",
          "always",
          {
              fallthrough: "never"
          }
      ],
      quotes: [
          "error",
          "double",
          {
              allowTemplateLiterals: true,
              avoidEscape: true
          }
      ]
  },
  parserOptions: {
      parser: "@typescript-eslint/parser",
  },
};
