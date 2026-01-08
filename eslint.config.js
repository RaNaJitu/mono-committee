const js = require('@eslint/js');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript version
      'no-unsafe-optional-chaining': 'warn', // Downgrade to warning (TypeScript handles this)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in scripts
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.log',
      'coverage/**',
      '.vscode/**',
      '.idea/**',
      '*.config.js',
      '*.config.mjs',
      'prisma/migrations/**',
    ],
  },
];
