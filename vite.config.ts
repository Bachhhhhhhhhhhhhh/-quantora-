import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '-quantora-'
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

/** Swap production script tags back to dev entry when running vite dev */
function devIndexPlugin(): Plugin {
  return {
    name: 'quantora-dev-index',
    apply: 'serve',
    transformIndexHtml(html) {
      return html
        .replace(
          /<script type="module" crossorigin src="[^"]*"><\/script>\s*/,
          '<script type="module" src="/src/main.tsx"></script>\n    ',
        )
        .replace(/<link rel="stylesheet" crossorigin href="[^"]*">\s*/, '')
    },
  }
}

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : '/',
  plugins: [react(), tailwindcss(), devIndexPlugin()],
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
  build: {
    rollupOptions: {
      input: resolve(rootDir, 'index.dev.html'),
    },
  },
})