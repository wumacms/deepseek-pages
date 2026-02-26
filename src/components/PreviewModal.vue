<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  template: { type: Object, required: true },
})

const emit = defineEmits(['close'])

function handleKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.classList.add('overflow-hidden')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('overflow-hidden')
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <h3 class="font-semibold text-slate-900 truncate pr-4">
          {{ template.title }}
        </h3>
        <div class="flex items-center gap-2 shrink-0">
          <a
            :href="`/pages/${template.file}`"
            target="_blank"
            rel="noopener noreferrer"
            title="新窗口打开"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white p-2 hover:bg-indigo-700 transition"
            aria-label="新窗口打开"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            class="rounded-lg border border-slate-300 text-slate-700 p-2 hover:bg-slate-50 transition"
            aria-label="关闭"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex-1 min-h-0 overflow-hidden">
        <iframe
          :src="`/pages/${template.file}`"
          :title="template.title"
          class="w-full h-full min-h-[70vh] border-0"
        />
      </div>
    </div>
  </div>
</template>
