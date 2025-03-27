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
    // proxy: {
    //   '/user': {
    //     target: 'https://38cr3ii47631.vicp.fun',  // 后端服务器地址
    //     changeOrigin: true,  // 修改请求头中的 origin
    //     secure: false,  // 如果使用 https，且自签名证书，需要设置为 false
    //     rewrite: (path) => path.replace(/^\/user/, ''),  // 去掉前缀 /user
    //   },
    // },
  },
})
