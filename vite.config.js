import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

function servePagesMiddleware(rootDir) {
  return (req, res, next) => {
    if (!req.url.startsWith('/pages/')) return next()
    const name = req.url.replace(/^\/pages\//, '').replace(/\?.*$/, '')
    const file = path.resolve(rootDir, name)
    const root = path.resolve(rootDir)
    if (!file.startsWith(root + path.sep) && file !== root) return next()
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
    const ext = path.extname(file)
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
    fs.createReadStream(file).pipe(res)
  }
}

// GitHub Pages 使用子路径: /仓库名/ ，本地开发使用根路径
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'

export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'serve-pages',
      configureServer(server) {
        server.middlewares.use(servePagesMiddleware(resolve(__dirname, 'pages')))
      },
      closeBundle() {
        const src = resolve(__dirname, 'pages')
        const dest = resolve(__dirname, 'dist', 'pages')
        if (!fs.existsSync(src)) return
        fs.mkdirSync(dest, { recursive: true })
        function copyDir(s, d) {
          fs.readdirSync(s).forEach(f => {
            const sPath = path.join(s, f)
            const dPath = path.join(d, f)
            if (fs.statSync(sPath).isDirectory()) {
              fs.mkdirSync(dPath, { recursive: true })
              copyDir(sPath, dPath)
            } else {
              fs.copyFileSync(sPath, dPath)
            }
          })
        }
        copyDir(src, dest)
      },
    },
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
