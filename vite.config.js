import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({ insertTypesEntry: true, rollupTypes: false })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'NotebookBar',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'vue-note-bar.js' : 'vue-note-bar.umd.cjs'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      exports: 'named'
      }
    }
  }
})
