import { defineConfig } from 'vitest/config'
import configPlugin from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [configPlugin()],
  test: {
    includeSource: ['src/*'],
    globals: true,
  },
})
