import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api2': {
                target: 'https://192.168.10.254:8006',
                changeOrigin: true,
                secure: false
            }
        }
    }
})