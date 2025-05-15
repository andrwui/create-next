import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import * as tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{jsx,tsx,mjs,ts,js}'],
    plugins: {
      react,
      '@next/next': next,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...Object.fromEntries(
        Object.entries(next.configs.recommended.rules).map(([key, value]) => [
          key.replace('@next/next/', '@next/next/'),
          value,
        ]),
      ),
      'react/react-in-jsx-scope': 0,
      "react/no-unknown-property": ["error", { "ignore": ["args"] }],
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 0,
      'prettier/prettier': [
        'error',
        {
          tabWidth: 2,
          endOfLine: 'auto',
          semi: false,
          printWidth: 100,
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
          jsxBracketSameLine: false,
          arrowParens: 'always',
          singleAttributePerLine: true,
          plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
        },
      ],
    },
  },
]

