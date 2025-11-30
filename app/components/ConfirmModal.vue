<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="p-6 text-center space-y-4">
        <div class="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
             :class="confirmColor === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'">
          <AlertTriangle :size="24" />
        </div>
        
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ message }}
        </p>

        <div v-if="showDontAsk" class="flex items-center justify-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="dontAskAgain" 
            v-model="dontAskAgain"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          <label for="dontAskAgain" class="text-sm text-gray-600 dark:text-gray-300 select-none cursor-pointer">
            אל תשאל שוב בפעילות זו
          </label>
        </div>
      </div>

      <div class="flex border-t border-gray-100 dark:border-gray-700">
        <button 
          @click="cancel"
          class="flex-1 py-4 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          ביטול
        </button>
        <div class="w-px bg-gray-100 dark:bg-gray-700"></div>
        <button 
          @click="confirm"
          class="flex-1 py-4 font-medium transition-colors"
          :class="confirmColor === 'red' ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'האם אתה בטוח?'
  },
  message: {
    type: String,
    default: 'פעולה זו לא ניתנת לביטול.'
  },
  confirmText: {
    type: String,
    default: 'מחק'
  },
  confirmColor: {
    type: String,
    default: 'red' // 'red' or 'blue'
  },
  showDontAsk: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const dontAskAgain = ref(false)

const confirm = () => {
  emit('confirm', dontAskAgain.value)
}

const cancel = () => {
  dontAskAgain.value = false 
  emit('cancel')
}
</script>
