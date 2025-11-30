<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="close">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ title }}</h3>
      </div>
      
      <div class="p-6">
        <DrumPicker
          ref="pickerRef"
          v-model="localValue"
          :min="min"
          :max="max"
          :step="step"
        />
      </div>

      <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <button 
          @click="close"
          class="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          ביטול
        </button>
        <button 
          @click="save"
          class="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-colors"
        >
          אישור
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import DrumPicker from './DrumPicker.vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  modelValue: Number,
  min: Number,
  max: Number,
  step: Number
})

const emit = defineEmits(['close', 'save', 'update:modelValue'])

const localValue = ref(props.modelValue)
const pickerRef = ref(null)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localValue.value = props.modelValue
    nextTick(() => {
      pickerRef.value?.focus()
    })
  }
})

const close = () => {
  emit('close')
}

const save = () => {
  emit('update:modelValue', localValue.value)
  emit('save', localValue.value)
  close()
}
</script>
