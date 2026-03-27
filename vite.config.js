import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page not found — MbomSign</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex;
      align-items: center; justify-content: center; background: #f1f5f9; color: #0f172a; }
    main { text-align: center; padding: 24px; }
    a { color: #1d4ed8; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>404</h1>
    <p>This page does not exist.</p>
    <p><a href="/">Back to MbomSign</a></p>
  </main>
</body>
</html>`

/** Only `/` serves the SPA; other paths (e.g. `/foo`) get 404 — matches production Express behavior. */
function spaOnlyRoot() {
  const mount = (isPreview) => (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    const pathname = new URL(req.url || '/', 'http://dev.local').pathname
    const devInternal =
      pathname.startsWith('/@') ||
      pathname.startsWith('/src') ||
      pathname.startsWith('/node_modules') ||
      pathname.startsWith('/__')
    const looksLikeFile = pathname.includes('.')
    const proxied =
      !isPreview &&
      (pathname.startsWith('/api') || pathname.startsWith('/waitlist-admin'))
    if (pathname === '/' || devInternal || looksLikeFile || proxied) return next()
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(notFoundHtml)
  }
  return {
    name: 'spa-only-root',
    configureServer(server) {
      server.middlewares.use(mount(false))
    },
    configurePreviewServer(server) {
      server.middlewares.use(mount(true))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [spaOnlyRoot(), react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/waitlist-admin': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
