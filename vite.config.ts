import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'color-machine',
      fileName: 'color-machine',
    },
  },
})
