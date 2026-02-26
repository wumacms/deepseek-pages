/**
 * 检测 pages/*.html 中的图片链接是否有效，并将失效链接替换为占位图
 * 运行: node scripts/check-and-fix-images.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pagesDir = path.join(__dirname, '..', 'pages')

// 占位图服务（稳定可用的公共占位图）
const PLACEHOLDER_BASE = 'https://placehold.co'
function getPlaceholderUrl(width = 800, height = 600) {
  return `${PLACEHOLDER_BASE}/${width}x${height}/e2e8f0/64748b?text=Image`
}

// 从 HTML 中提取所有 <img src="..."> 的 URL（仅图片，不含 script/link）
function extractImageUrls(html) {
  const urls = []
  const re = /<img[^>]+src="(https?:\/\/[^"]+)"/gi
  let m
  while ((m = re.exec(html)) !== null) urls.push(m[1])
  return urls
}

// 检查单个 URL 是否可访问（HEAD 请求，跟随重定向）
async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageChecker/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    return res.ok // 2xx
  } catch (e) {
    return false
  }
}

async function main() {
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'))
  const allImgUrlsByFile = new Map()
  const urlToFiles = new Map()

  for (const file of files) {
    const filePath = path.join(pagesDir, file)
    const html = fs.readFileSync(filePath, 'utf-8')
    const urls = extractImageUrls(html)
    if (urls.length) {
      allImgUrlsByFile.set(file, { filePath, html, urls })
      for (const u of urls) {
        if (!urlToFiles.has(u)) urlToFiles.set(u, [])
        urlToFiles.get(u).push(file)
      }
    }
  }

  const uniqueUrls = [...new Set(urlToFiles.keys())]
  console.log(`共 ${files.length} 个 HTML 文件，${uniqueUrls.length} 个不重复图片链接，开始检测（并发 20）…`)

  const CONCURRENCY = 20
  const status = new Map()
  for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY) {
    const batch = uniqueUrls.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(async (url) => ({ url, ok: await checkUrl(url) })))
    for (const { url, ok } of results) {
      status.set(url, ok)
      if (!ok) console.log('  失效:', url.slice(0, 80) + (url.length > 80 ? '…' : ''))
    }
  }

  const broken = [...status.entries()].filter(([, ok]) => !ok).map(([u]) => u)
  if (broken.length === 0) {
    console.log('未发现失效图片链接。')
    return
  }

  console.log(`\n发现 ${broken.length} 个失效链接，正在替换为占位图…`)

  // 替换策略：失效 URL 替换为同尺寸占位图（从原 URL 尽量解析 w/h，否则默认 800x600）
  function replaceUrl(url) {
    if (!status.get(url)) {
      let w = 800,
        h = 600
      const wm = url.match(/[?&]w=(\d+)/i)
      const hm = url.match(/[?&]h=(\d+)/i)
      if (wm) w = parseInt(wm[1], 10)
      if (hm) h = parseInt(hm[1], 10)
      return getPlaceholderUrl(w, h)
    }
    return url
  }

  let replaceCount = 0
  for (const [file, { filePath, html, urls }] of allImgUrlsByFile) {
    let newHtml = html
    const brokenInFile = [...new Set(urls)].filter((u) => !status.get(u))
    for (const url of brokenInFile) {
      const placeholder = replaceUrl(url)
      const occurrences = (newHtml.match(new RegExp(escapeRe(url), 'g')) || []).length
      newHtml = newHtml.split(url).join(placeholder)
      replaceCount += occurrences
    }
    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf-8')
    }
  }

  console.log(`已替换 ${replaceCount} 处引用并写回文件。`)
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
