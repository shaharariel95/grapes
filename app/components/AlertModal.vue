<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="p-6 text-center space-y-4">
        <div class="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Info :size="24" />
        </div>
        
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ message }}
        </p>
      </div>

      <div class="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button 
          @click="close"
          class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-colors"
        >
          אישור
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Info } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'הודעה'
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>
