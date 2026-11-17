import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 前端开发服务器配置
export default defineConfig({
  plugins: [vue()],
  // 用相对路径打包，保证生成的 HTML 在 file:// 下也能加载资源
  base: './',
  server: {
    port: 5173,
    open: true
  }
})
