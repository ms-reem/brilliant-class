import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/brilliance-class/',
    server: {
        port: 8080
    }
})
