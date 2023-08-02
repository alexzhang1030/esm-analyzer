import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  target: 'es2015',
  format: ['esm', 'cjs'],
  dts: true,
})
