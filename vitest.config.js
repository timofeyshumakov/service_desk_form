// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom', // Изменено с jsdom на happy-dom
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})