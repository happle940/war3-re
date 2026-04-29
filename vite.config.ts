import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === 'true' && !!repoName

  return {
    base: isGithubPagesBuild ? `/${repoName}/` : '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  }
})
