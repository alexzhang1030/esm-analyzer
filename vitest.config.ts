import configPlugin from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [configPlugin()],
  test: {
    includeSource: ['src/*'],
    globals: true,
  },
})
