import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5500, // 设置运行端口
    proxy: {
      '/api': {
        target: 'http://101.42.141.72:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/user': {
        target: 'http://101.42.141.72:7001/',
        changeOrigin: true,
        rewrite: (path) => path  // 不去掉任何部分，路径保持原样

      }
    }

  },
})
