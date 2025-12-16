// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// vite.config.ts
export default defineConfig({
    base: '/',
    build: {
        outDir: 'docs',
    },
})