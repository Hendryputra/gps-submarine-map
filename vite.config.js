import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: "/gps-submarine-map/", // sesuai nama repo
  plugins: [vue()],
})
