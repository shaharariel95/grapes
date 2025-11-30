<template>
  <div class="flex flex-col items-center">
    <label v-if="label" class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{{ label }}</label>
    
    <!-- Direct Input -->
    <div class="mb-4 relative">
      <input
        v-model="inputValue"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        class="w-24 text-center text-3xl font-bold bg-transparent border-b-2 border-blue-500/30 focus:border-blue-500 outline-none transition-colors text-gray-900 dark:text-white p-2"
        @blur="handleInputChange"
        @keydown.enter="handleInputChange"
      />
    </div>

    <div ref="container"
      class="relative h-48 w-full overflow-y-auto scroll-smooth snap-y snap-mandatory no-scrollbar cursor-grab select-none outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg"
      tabindex="0" @scroll="handleScroll" @keydown="handleKeydown">
      <!-- Center Indicator Line (fixed) -->
      <div class="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/30 -translate-y-1/2 pointer-events-none z-10">
      </div>

      <!-- Padding for centering first/last items -->
      <div class="h-[calc(50%-24px)]"></div>

      <div v-for="val in range" :key="val"
        class="h-12 flex items-center justify-center snap-center transition-all duration-150"
        @click="scrollToValue(val)">
        <div class="flex items-center justify-center w-full transition-all duration-150" :style="getItemStyle(val)">
          <!-- Horizontal Line -->
          <div class="h-[2px] rounded-full bg-gray-300 dark:bg-gray-600 transition-all duration-150 mr-3"
            :style="getLineStyle(val)"></div>

          <!-- Number -->
          <span class="text-lg font-variant-numeric tabular-nums transition-all duration-150" :class="{
            'text-blue-600 dark:text-blue-400 font-bold text-2xl': currentValue === val,
            'text-gray-400 dark:text-gray-500': currentValue !== val
          }">
            {{ val }}
          </span>
          <!-- Horizontal Line (Right side for symmetry) -->
          <div class="h-[2px] rounded-full bg-gray-300 dark:bg-gray-600 transition-all duration-150 ml-3"
            :style="getLineStyle(val)"></div>
        </div>
      </div>

      <!-- Padding for centering first/last items -->
      <div class="h-[calc(50%-24px)]"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
const currentValue = ref(props.modelValue)
const inputValue = ref(props.modelValue)
const localMax = ref(props.max)

// Update localMax if props change
watch(() => props.max, (newMax) => {
  if (newMax > localMax.value) {
    localMax.value = newMax
  }
})

// Generate range
const range = computed(() => {
  const arr = []
  for (let i = props.min; i <= localMax.value; i += props.step) {
    arr.push(i)
  }
  return arr
})

const getItemStyle = (val) => {
  return {}
}

const getLineStyle = (val) => {
  const isSelected = currentValue.value === val
  const distance = Math.abs(currentValue.value - val)
  const isNear = distance <= props.step

  let width = '20px'
  if (isSelected) width = '60px'
  else if (isNear) width = '40px'

  return {
    width: width,
    opacity: isSelected ? 1 : (isNear ? 0.6 : 0.3)
  }
}

const handleScroll = () => {
  if (!container.value) return

  const scrollTop = container.value.scrollTop
  const itemHeight = 48

  const index = Math.round(scrollTop / itemHeight)
  const val = range.value[index]

  if (val !== undefined && val !== currentValue.value) {
    currentValue.value = val
    inputValue.value = val
    emit('update:modelValue', val)
  }
}

const scrollToValue = (val, smooth = true) => {
  if (!container.value) return
  const index = range.value.indexOf(val)
  if (index === -1) return

  const itemHeight = 48
  container.value.scrollTo({
    top: index * itemHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// --- Input Logic ---
const handleInputChange = () => {
  let val = Number(inputValue.value)
  
  // Clamp value (only min)
  if (isNaN(val)) val = props.min
  if (val < props.min) val = props.min
  
  // Extend max if needed
  if (val > localMax.value) {
    localMax.value = val
  }
  
  // Round to nearest step
  const remainder = (val - props.min) % props.step
  if (remainder !== 0) {
    val = val - remainder
    if (remainder > props.step / 2) val += props.step
  }

  inputValue.value = val
  currentValue.value = val
  emit('update:modelValue', val)
  
  // Wait for range to update before scrolling
  nextTick(() => {
    scrollToValue(val, true)
  })
}

// --- Keyboard Logic ---
const handleKeydown = (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const currentIndex = range.value.indexOf(currentValue.value)
    if (currentIndex > 0) {
      const newVal = range.value[currentIndex - 1]
      scrollToValue(newVal)
      // Update input value as well
      inputValue.value = newVal
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    const currentIndex = range.value.indexOf(currentValue.value)
    if (currentIndex < range.value.length - 1) {
      const newVal = range.value[currentIndex + 1]
      scrollToValue(newVal)
      // Update input value as well
      inputValue.value = newVal
    }
  }
}

// Watch for external updates
watch(() => props.modelValue, (newVal) => {
  if (newVal !== currentValue.value) {
    currentValue.value = newVal
    inputValue.value = newVal
    nextTick(() => {
      scrollToValue(newVal, false)
    })
  }
})

onMounted(() => {
  scrollToValue(props.modelValue, false)
})

defineExpose({
  focus: () => container.value?.focus()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
