import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  bundle: true,
  sourcemap: false,
  minify: false,
  clean: true,
})
