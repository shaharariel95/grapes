<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h2 class="text-xl font-bold">הגדרות סקאלות</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <X :size="24" />
        </button>
      </div>

      <div class="p-6 space-y-8">
        <div v-for="(config, key) in settings" :key="key" class="space-y-3">
          <h3 class="font-semibold text-lg border-b pb-1 border-gray-100 dark:border-gray-700">
            {{ getLabel(key) }}
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">מינימום</label>
              <input 
                v-model.number="config.min" 
                type="number" 
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">מקסימום</label>
              <input 
                v-model.number="config.max" 
                type="number" 
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">קפיצות</label>
              <input 
                v-model.number="config.step" 
                type="number" 
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
        <div class="flex gap-3">
          <button 
            @click="resetSettings"
            class="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            אפס לברירת מחדל
          </button>
          <button 
            @click="$emit('close')"
            class="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-colors"
          >
            שמור וסגור
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { useSettings } from '../composables/useSettings'

const { settings, resetSettings } = useSettings()

defineEmits(['close'])

const getLabel = (key) => {
  const labels = {
    feedingAmount: 'כמות האכלה (מ״ל)',
    sensor: 'חיישן',
    glucometer: 'גלוקומטר',
    drip: 'טיפטוף'
  }
  return labels[key] || key
}
</script>
