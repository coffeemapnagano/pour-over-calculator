import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pour-over-calculator/', // ← ここにリポジトリ名を追加（重要！）
})