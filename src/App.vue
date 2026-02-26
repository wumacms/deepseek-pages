<script setup>
import { ref, computed } from 'vue'
import templatesData from './data/templates.json'
import TemplateCard from './components/TemplateCard.vue'
import PreviewModal from './components/PreviewModal.vue'

const templates = ref(templatesData)
const searchQuery = ref('')
const appliedSearchQuery = ref('') // 点击搜索按钮后生效
const selectedTag = ref('')
const previewTemplate = ref(null)

function applySearch() {
  appliedSearchQuery.value = searchQuery.value.trim()
}

const allTags = computed(() => {
  const set = new Set()
  templates.value.forEach(t => t.tags.forEach(tag => set.add(tag)))
  return Array.from(set).sort()
})

const filteredTemplates = computed(() => {
  let list = templates.value
  if (appliedSearchQuery.value) {
    const q = appliedSearchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }
  if (selectedTag.value) {
    list = list.filter(t => t.tags.includes(selectedTag.value))
  }
  return list
})

function openPreview(t) {
  previewTemplate.value = t
}

function closePreview() {
  previewTemplate.value = null
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          企业落地页模板 · 展厅
        </h1>
        <p class="mt-1 text-slate-600 text-sm sm:text-base">
          共 {{ templates.length }} 个模板，支持预览与筛选
        </p>
        <div class="mt-4 space-y-4">
          <div class="flex flex-wrap gap-2">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="搜索模板标题或标签…"
              class="flex-1 min-w-[200px] max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
              @keydown.enter.prevent="applySearch"
            />
            <button
              type="button"
              class="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 outline-none transition"
              @click="applySearch"
            >
              搜索
            </button>
          </div>
          <div class="flex flex-wrap gap-2 items-center">
            <span class="text-slate-500 text-sm shrink-0">标签：</span>
            <button
              v-for="tag in allTags"
              :key="tag"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition',
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              ]"
              @click="selectedTag = selectedTag === tag ? '' : tag"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        v-if="filteredTemplates.length === 0"
        class="text-center py-16 text-slate-500"
      >
        暂无匹配的模板，试试调整搜索或标签筛选。
      </div>
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
      >
        <TemplateCard
          v-for="t in filteredTemplates"
          :key="t.id"
          :template="t"
          @preview="openPreview(t)"
        />
      </div>
    </main>

    <PreviewModal
      v-if="previewTemplate"
      :template="previewTemplate"
      @close="closePreview"
    />
  </div>
</template>
