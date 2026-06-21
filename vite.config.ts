import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '-quantora-'
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
})