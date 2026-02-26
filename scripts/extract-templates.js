/**
 * 从 pages/*.html 提取 <title> 并推断标签，输出 templates.json
 * 运行: node scripts/extract-templates.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pagesDir = path.join(__dirname, '..', 'pages')
const outPath = path.join(__dirname, '..', 'src', 'data', 'templates.json')

// 关键词 -> 标签 映射（用于从标题推断标签）
const tagRules = [
  [['企业', '落地页', '商务', '协作', '平台', 'SaaS'], '企业'],
  [['医疗', '健康', '体检', '诊断', '诊所', '医院'], '医疗'],
  [['教育', '培训', '学苑', 'K12', '早教', '在线教学'], '教育'],
  [['餐饮', '咖啡', '火锅', '食堂', '美食', '快餐'], '餐饮'],
  [['AI', '智能', '科技', '智造', '半导体', '芯片'], '科技'],
  [['地产', '建筑', '置业', '空间', '住宅', '商业地产'], '地产'],
  [['法律', '法务', '律师', '知识产权'], '法律'],
  [['投资', '理财', '银行', '财策', '金融'], '金融'],
  [['设计', '创意', '品牌', '视觉', '摄影', '传播'], '设计'],
  [['物流', '速递', '跨境', '电商'], '物流'],
  [['能源', '环保', '太阳能', '减排', '绿'], '能源'],
  [['游戏', '手游', '电玩', '动漫'], '文娱'],
  [['旅游', '度假', '旅行', '出境'], '旅游'],
  [['家居', '家具', '智能家居'], '家居'],
  [['健身', '瑜伽', '运动'], '运动'],
  [['婚礼', '婚纱', '婚庆'], '婚庆'],
  [['宠物'], '宠物'],
  [['珠宝', '奢侈品', '腕表', '护肤'], '时尚'],
  [['消防', '安防', '监控'], '安防'],
  [['会展', '广告', '营销'], '营销'],
  [['工业', '制造', '印刷', '设备'], '工业'],
  [['航天', '轨道交通', '空调'], '制造'],
]

const keywordToTag = new Map()
tagRules.forEach(([keywords, tag]) => keywords.forEach(k => keywordToTag.set(k, tag)))

function inferTags(title) {
  const tags = new Set()
  tags.add('落地页') // 默认
  for (const [keyword, tag] of keywordToTag) {
    if (title.includes(keyword)) tags.add(tag)
  }
  return Array.from(tags)
}

function extractTitle(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf-8')
  const m = content.match(/<title>\s*([^<]*?)\s*<\/title>/i)
  return m ? m[1].trim() : path.basename(htmlPath, '.html')
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).sort()
const templates = files.map(file => {
  const filePath = path.join(pagesDir, file)
  const title = extractTitle(filePath)
  const tags = inferTags(title)
  return {
    id: file.replace(/\.html$/, ''),
    file,
    title,
    tags,
  }
})

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(templates, null, 2), 'utf-8')
console.log(`Generated ${templates.length} templates -> ${outPath}`)
