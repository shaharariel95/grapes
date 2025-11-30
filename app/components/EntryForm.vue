<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">{{ editingId ? 'ערוך רשומה' : 'הוסף רשומה חדשה' }}</h2>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- 1. Time (Full Width) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <label class="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">זמן</label>
        <input
          v-model="localForm.time"
          type="datetime-local"
          required
          class="w-full bg-transparent border-none p-0 text-lg font-semibold focus:ring-0 text-gray-900 dark:text-white"
        />
      </div>

      <!-- 2. Food Type (Full Width) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <label class="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">סוג מזון</label>
        <input
          v-model="localForm.nutritionType"
          type="text"
          list="food-suggestions"
          class="w-full bg-transparent border-none p-0 text-lg font-semibold focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
          placeholder="הזן סוג מזון..."
        />
        <datalist id="food-suggestions">
          <option v-for="type in uniqueFoodTypes" :key="type" :value="type" />
        </datalist>
      </div>

      <!-- 3. Amount & Sensor (Half Width) -->
      <div class="grid grid-cols-2 gap-4">
        <button
          type="button"
          @click="openPicker('feedingAmount')"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
        >
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">כמות (מ״ל)</span>
          <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ localForm.feedingAmount }}</span>
        </button>

        <button
          type="button"
          @click="openPicker('sensor')"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
        >
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">חיישן</span>
          <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ localForm.sensor }}</span>
        </button>
      </div>

      <!-- 4. Glucometer & Drip (Half Width) -->
      <div class="grid grid-cols-2 gap-4">
        <button
          type="button"
          @click="openPicker('glucometerReading')"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
        >
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">גלוקומטר</span>
          <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ localForm.glucometerReading }}</span>
        </button>

        <button
          type="button"
          @click="openPicker('drip')"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
        >
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">טיפטוף</span>
          <span class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{{ localForm.drip }}</span>
        </button>
      </div>

      <!-- 5. Extra (Full Width) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <label class="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">תוספות / הערות</label>
        <textarea
          v-model="localForm.extra"
          rows="2"
          class="w-full bg-transparent border-none p-0 text-base focus:ring-0 text-gray-900 dark:text-white resize-none placeholder-gray-400"
          placeholder="מידע נוסף..."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-colors shadow-lg shadow-blue-500/30"
        >
          {{ editingId ? 'עדכן רשומה' : 'הוסף רשומה' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-4 px-6 rounded-2xl transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>

    <!-- Picker Modal -->
    <PickerModal
      :is-open="pickerState.isOpen"
      :title="pickerState.title"
      :model-value="pickerState.value"
      :min="pickerState.min"
      :max="pickerState.max"
      :step="pickerState.step"
      @close="pickerState.isOpen = false"
      @save="handlePickerSave"
    />
  </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'
import PickerModal from './PickerModal.vue'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  initial: { type: Object, default: null },
  editingId: { type: [Number, String, null], default: null },
  existingEntries: { type: Array, default: () => [] }
})

const emit = defineEmits(['save', 'cancel'])
const { settings } = useSettings()

const uniqueFoodTypes = computed(() => {
  const types = new Set(props.existingEntries.map(e => e.nutritionType).filter(Boolean))
  return Array.from(types).sort()
})

const makeDefault = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return {
    time: now.toISOString().slice(0, 16),
    nutritionType: '',
    feedingAmount: 60,
    sensor: 100,
    glucometerReading: 100,
    drip: 0,
    extra: ''
  }
}

const localForm = reactive(props.initial ? { ...props.initial } : makeDefault())

watch(() => props.initial, (nv) => {
  if (nv) {
    Object.assign(localForm, {
      sensor: 100,
      drip: 0,
      extra: '',
      ...nv
    })
  } else {
    Object.assign(localForm, makeDefault())
  }
}, { immediate: true })

// Picker Logic
const pickerState = reactive({
  isOpen: false,
  field: null,
  title: '',
  value: 0,
  min: 0,
  max: 100,
  step: 1
})

const openPicker = (field) => {
  const config = settings[field === 'glucometerReading' ? 'glucometer' : field]
  const labels = {
    feedingAmount: 'כמות האכלה (מ״ל)',
    sensor: 'חיישן',
    glucometerReading: 'גלוקומטר',
    drip: 'טיפטוף'
  }

  pickerState.field = field
  pickerState.title = labels[field]
  pickerState.value = Number(localForm[field])
  pickerState.min = config.min
  pickerState.max = config.max
  pickerState.step = config.step
  pickerState.isOpen = true
}

const handlePickerSave = (val) => {
  if (pickerState.field) {
    localForm[pickerState.field] = val
  }
}

const onSubmit = () => {
  const payload = {
    time: localForm.time,
    nutritionType: localForm.nutritionType,
    feedingAmount: Number(localForm.feedingAmount),
    sensor: Number(localForm.sensor),
    glucometerReading: Number(localForm.glucometerReading),
    drip: Number(localForm.drip),
    extra: localForm.extra
  }
  emit('save', payload)
}
</script>
