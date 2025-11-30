<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
    <div class="max-w-4xl mx-auto px-4 py-3 flex justify-around">
      <button
        @click="$emit('change-page', '/')"
        :class="[
          'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
          currentPage === '/'
            ? 'bg-primary text-slate-300 border-2 border-slate-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <Plus :size="24" />
  <span class="text-xs font-medium">הוסף רשומה</span>
      </button>
      <button
        @click="$emit('change-page', 'history')"
        :class="[
          'flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-colors',
          currentPage === 'history'
            ? 'bg-primary text-slate-300 border-2 border-slate-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <List :size="24" />
  <span class="text-xs font-medium">היסטוריה</span>
      </button>
      <button
        @click="$emit('change-page', 'stats')"
        :class="[
          'flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-colors',
          currentPage === 'stats'
            ? 'bg-primary text-slate-300 border-2 border-slate-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6"/><path d="M18 20v-10"/><path d="M6 20v-4"/><path d="M21 3H3v18h18V3z"/></svg>
  <span class="text-xs font-medium">סטטיסטיקה</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { Plus, List } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: String, default: 'index' }
})
</script>
