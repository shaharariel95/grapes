<template>
  <div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold mb-6">היסטוריית האכלה</h2>
    <button
      @click="downloadCSV"
      class="mb-6 p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-lg transition-colors"
      aria-label="הורד CSV"
    >
      הורד CSV
    </button>
  </div>

    <div v-if="entries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <Baby :size="48" class="mx-auto mb-4 opacity-50" />
      <p>אין רשומות האכלה עדיין. הוסף את הרשומה הראשונה!</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-colors"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <Clock :size="18" class="text-blue-500" />
            <span class="font-semibold">{{ formatDateTime(entry.time) }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="$emit('edit-entry', entry)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="ערוך רשומה"
            >
              <Edit2 :size="16" />
            </button>
            <button
              @click="$emit('delete-entry', entry.id)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="מחק רשומה"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2">
            <Milk :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">האכלה</div>
              <div class="font-medium">{{ entry.feedingAmount }} מ״ל</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Activity :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">חיישן</div>
              <div class="font-medium">{{ entry.sensor ?? '-' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Droplet :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">טיפטוף</div>
              <div class="font-medium">{{ entry.drip ?? '-' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <FileText :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">הערות</div>
              <div class="font-medium truncate max-w-[100px]">{{ entry.extra || '-' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Activity :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">גלוקוז</div>
              <div class="font-medium">{{ entry.glucometerReading ?? '-' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Utensils :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">סוג</div>
              <div class="font-medium">{{ entry.nutritionType }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Milk, Activity, Utensils, Scale, Edit2, Trash2, Baby, Droplet, FileText, Radio } from 'lucide-vue-next'

const props = defineProps({
  entries: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit-entry', 'delete-entry'])

const sortedEntries = computed(() => {
  return [...props.entries].sort((a, b) => new Date(b.time) - new Date(a.time))
})

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleString('he-IL', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  })
}

// CSV helpers and download
const escapeCSV = (val) => {
  if (val === null || val === undefined) return ''
  let s = String(val)
  if (s.includes('"')) s = s.replace(/"/g, '""')
  if (s.includes(',') || s.includes('\n') || s.includes('"')) return `"${s}"`
  return s
}

const buildCSV = () => {
  const headers = ['id', 'זמן', 'האכלה (מ״ל)', 'חיישן', 'גלוקוז', 'טיפטוף', 'סוג', 'הערות']
  const rows = [headers.map(escapeCSV).join(',')]

  for (const e of props.entries) {
    const row = [
      e.id ?? '',
      formatDateTime(e.time),
      e.feedingAmount ?? '',
      e.sensor ?? '',
      e.glucometerReading ?? '',
      e.drip ?? '',
      e.nutritionType ?? '',
      e.extra ?? ''
    ].map(escapeCSV).join(',')

    rows.push(row)
  }

  // Prepend UTF-8 BOM so Excel/other programs detect UTF-8 and show Hebrew correctly
  return '\uFEFF' + rows.join('\n')
}

const downloadCSV = () => {
  if (!props.entries || props.entries.length === 0) {
    alert('אין נתונים להורדה')
    return
  }

  const csv = buildCSV()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `feeding-entries-${dateStr}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
