/**
 * 轻量截图落库服务器
 *
 * 用法：node scripts/screenshot-server.mjs
 * 游戏中按 P 截图 → 浏览器 POST PNG 数据 → 此服务器写入 screenshots/
 *
 * 无外部依赖，仅使用 Node.js 内置模块。
 */

import { createServer } from 'node:http'
import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCREENSHOTS_DIR = resolve(__dirname, '..', 'screenshots')
const PORT = 3456

await mkdir(SCREENSHOTS_DIR, { recursive: true })

const server = createServer(async (req, res) => {
  // CORS — 允许浏览器跨域 POST
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url?.startsWith('/screenshot')) {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const rawName = url.searchParams.get('name') || `screenshot_${Date.now()}`
    const fileName = rawName.endsWith('.png') ? rawName : `${rawName}.png`
    const filePath = resolve(SCREENSHOTS_DIR, fileName)

    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const data = Buffer.concat(chunks)

    await writeFile(filePath, data)
    console.log(`  Saved: ${fileName} (${(data.length / 1024).toFixed(1)} KB)`)

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('OK')
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`Screenshot server listening on http://localhost:${PORT}`)
  console.log(`Files will be saved to: ${SCREENSHOTS_DIR}`)
  console.log('Press Ctrl+C to stop\n')
})
