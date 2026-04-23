import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { realpathSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  root: realpathSync(process.cwd()),
  plugins: [react()],
})
