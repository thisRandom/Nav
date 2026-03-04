import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/istore-api': {
                target: 'http://192.168.100.1', // 路由器地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/istore-api/, '')
            }
        }
    }
})