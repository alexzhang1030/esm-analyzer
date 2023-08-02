import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  target: 'es2017',
  format: ['esm', 'cjs'],
  dts: true,
})
