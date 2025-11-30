<template>
  <header class="bg-slate-200 rounded-xl dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">🍼 מעקב האכלה לתינוק</h1>
      <div class="flex items-center gap-2">
        <button @click="$emit('open-settings')"
          class="p-2 rounded-lg bg-slate-300 hover:bg-blue-600 text-white transition-colors" aria-label="הגדרות">
          <Settings :size="20" color="black" />
        </button>
        <button @click="$emit('toggle-theme')"
          class="p-2 rounded-lg bg-slate-300 hover:bg-blue-600 text-white transition-colors" aria-label="החלף נושא">
          <ClientOnly>
            <Sun v-if="isDark" :size="20" />
            <Moon v-else :size="20" color="black" />
            <template #fallback>
              <Moon :size="20" color="black" />
            </template>
          </ClientOnly>
        </button>
        <button @click="$emit('logout')"
          class="p-2 rounded-lg bg-slate-300 hover:bg-red-600 text-white transition-colors" aria-label="התנתק">
          <LogOut :size="20" color="black" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { toRef } from 'vue'
import { Sun, Moon, Settings, LogOut } from 'lucide-vue-next'

const props = defineProps({
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-theme', 'open-settings', 'logout'])
</script>
