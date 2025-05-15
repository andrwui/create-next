import js from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{jsx,tsx,mjs,ts,js}'],
    plugins: {},
    rules: {
      'no-undef': 0,
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
        },
      ],
    },
  },
]
