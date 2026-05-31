import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/api/ted': {
        target: 'https://api.ted.europa.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ted/, ''),
        secure: true,
      },
    },
  },
})
