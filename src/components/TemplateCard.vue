<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['preview'])

const PLACEHOLDER_COVER = 'https://placehold.co/200x100'
const base = import.meta.env.BASE_URL

function pageUrl(file) {
  return `${base}pages/${file}`
}

function coverUrl(template) {
  return `${base}covers/${template.id}.png`
}

const imgSrc = ref(coverUrl(props.template))
watch(
  () => props.template.id,
  (id) => {
    imgSrc.value = coverUrl(props.template)
  }
)
function onCoverError() {
  imgSrc.value = PLACEHOLDER_COVER
}
</script>

<template>
  <article
    class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition flex flex-col"
  >
    <a
      :href="pageUrl(template.file)"
      target="_blank"
      rel="noopener noreferrer"
      class="block aspect-[2/1] bg-slate-100 overflow-hidden"
    >
      <img
        :src="imgSrc"
        :alt="template.title"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onCoverError"
      />
    </a>
    <div class="p-4 flex-1 flex flex-col">
      <h2 class="font-semibold text-slate-900 line-clamp-2 leading-snug">
        {{ template.title }}
      </h2>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="tag in template.tags.slice(0, 4)"
          :key="tag"
          class="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs"
        >
          {{ tag }}
        </span>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition"
          @click="emit('preview')"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          预览
        </button>
        <a
          :href="pageUrl(template.file)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700 text-sm font-medium py-2.5 px-4 hover:bg-slate-50 transition"
          title="新窗口打开"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </article>
</template>
