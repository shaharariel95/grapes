<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold mb-6">היסטוריית האכלה</h2>
      <div class="flex gap-2 mb-6">
        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="processFile">
        <button @click="handleImport"
          class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          aria-label="ייבא CSV">
          <Upload :size="20" />
          <span>ייבא CSV</span>
        </button>
        <button @click="downloadCSV"
          class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          aria-label="הורד CSV">
          <Download :size="20" />
          <span>הורד CSV</span>
        </button>
      </div>
    </div>

    <div v-if="entries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <Baby :size="48" class="mx-auto mb-4 opacity-50" />
      <p>אין רשומות האכלה עדיין. הוסף את הרשומה הראשונה!</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="entry in sortedEntries" :key="entry.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <Clock :size="18" class="text-blue-500" />
            <span class="font-semibold">{{ formatDateTime(entry.time) }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="$emit('edit-entry', entry)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="ערוך רשומה">
              <Edit2 :size="16" />
            </button>
            <button @click="handleDeleteClick(entry.id)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="מחק רשומה">
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

    <ConfirmModal :is-open="showDeleteModal" title="מחיקת רשומה"
      message="האם אתה בטוח שברצונך למחוק רשומה זו? פעולה זו לא ניתנת לביטול." @confirm="confirmDelete"
      @cancel="cancelDelete" />

    <AlertModal :is-open="showAlertModal" :title="alertTitle" :message="alertMessage" @close="closeAlert" />

    <ConfirmModal :is-open="showImportWarningModal" title="אזהרת ייבוא" :message="importWarningMessage"
      confirm-text="המשך" confirm-color="blue" :show-dont-ask="false" @confirm="confirmImport" @cancel="cancelImport" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppEntries } from '../composables/useAppEntries'
import { Clock, Milk, Activity, Utensils, Scale, Edit2, Trash2, Baby, Droplet, FileText, Radio, Upload, Download } from 'lucide-vue-next'
// Components are auto-imported by Nuxt

const props = defineProps({
  entries: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit-entry'])

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
  const headers = ['id', 'זמן', 'האכלה (מ״ל)', 'חיישן', 'גלוקוז', 'טיפטוף', 'סוג', 'הערות', 'iso_time']
  const rows = [headers.map(escapeCSV).join(',')]

  const entriesToExport = sortedEntries.value

  for (const e of entriesToExport) {
    const row = [
      e.id ?? '',
      formatDateTime(e.time),
      e.feedingAmount ?? '',
      e.sensor ?? '',
      e.glucometerReading ?? '',
      e.drip ?? '',
      e.nutritionType ?? '',
      e.extra ?? '',
      e.time ?? ''
    ].map(escapeCSV).join(',')

    rows.push(row)
  }

  // Prepend UTF-8 BOM so Excel/other programs detect UTF-8 and show Hebrew correctly
  return '\uFEFF' + rows.join('\n')
}

const downloadCSV = () => {
  if (!sortedEntries.value || sortedEntries.value.length === 0) {
    showAlert('שגיאה', 'אין נתונים להורדה')
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


// Import Logic
const fileInput = ref(null)
const { importEntries } = useAppEntries()

const handleImport = () => {
  fileInput.value.click()
}

const parseHebrewDate = (dateStr) => {
  if (!dateStr) return null

  // Expected format: "DD MMM, HH:mm" or similar
  // Example: "4 בנוב׳, 9:37"

  const hebrewMonths = {
    'ינו׳': 0, 'ינואר': 0,
    'פבר׳': 1, 'פברואר': 1,
    'מרץ': 2,
    'אפר׳': 3, 'אפריל': 3,
    'מאי': 4,
    'יוני': 5,
    'יולי': 6,
    'אוג׳': 7, 'אוגוסט': 7,
    'ספט׳': 8, 'ספטמבר': 8,
    'אוק׳': 9, 'אוקטובר': 9,
    'נוב׳': 10, 'נובמבר': 10,
    'דצמ׳': 11, 'דצמבר': 11
  }

  try {
    // Remove quotes if present
    dateStr = dateStr.replace(/"/g, '').trim()

    // Split into date and time parts
    // "4 בנוב׳, 9:37" -> ["4 בנוב׳", "9:37"]
    const parts = dateStr.split(',')
    if (parts.length < 2) return null

    const datePart = parts[0].trim() // "4 בנוב׳"
    const timePart = parts[1].trim() // "9:37"

    const dateParts = datePart.split(' ')
    if (dateParts.length < 2) return null

    const day = parseInt(dateParts[0])
    let monthStr = dateParts[1]

    // Normalize apostrophes (replace ' with ׳)
    monthStr = monthStr.replace(/'/g, '׳')

    let month = hebrewMonths[monthStr]

    // Try removing 'ב' prefix (common in Hebrew dates: "4 בנוב׳" = "4 in Nov")
    if (month === undefined && monthStr.startsWith('ב')) {
      month = hebrewMonths[monthStr.slice(1)]
    }

    if (month === undefined || isNaN(day)) return null

    const [hours, minutes] = timePart.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return null

    const now = new Date()
    const year = now.getFullYear()

    const date = new Date(year, month, day, hours, minutes)

    // Handle edge case: if we are in Jan and importing Dec, it might be last year
    // But for now we stick to current year as agreed

    return date.toISOString()
  } catch (e) {
    console.error('Error parsing Hebrew date:', dateStr, e)
    return null
  }
}

const processFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const text = e.target.result

      const rows = text.split('\n').map(row => row.trim()).filter(row => row)

      // Remove BOM if present
      if (rows[0].charCodeAt(0) === 0xFEFF) {
        rows[0] = rows[0].slice(1)
      }

      // Parse headers
      const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim())

      // Find column indices dynamically
      const isoTimeIndex = headers.indexOf('iso_time')
      const timeIndex = headers.findIndex(h => h.includes('זמן'))
      const feedingIndex = headers.findIndex(h => h.includes('האכלה'))
      const sensorIndex = headers.findIndex(h => h.includes('חיישן'))
      const glucoseIndex = headers.findIndex(h => h.includes('גלוקוז'))
      const dripIndex = headers.findIndex(h => h.includes('טיפטוף'))
      const typeIndex = headers.findIndex(h => h.includes('סוג'))
      const notesIndex = headers.findIndex(h => h.includes('הערות'))

      // Skip header row
      const dataRows = rows.slice(1)

      const newEntries = dataRows.map((row) => {
        // Handle quoted values (basic CSV parser)
        let values = []
        let inQuote = false
        let currentValue = ''

        for (let i = 0; i < row.length; i++) {
          const char = row[i]
          if (char === '"') {
            inQuote = !inQuote
          } else if (char === ',' && !inQuote) {
            values.push(currentValue)
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        values.push(currentValue)

        // Clean up quotes
        values = values.map(v => {
          v = v.trim()
          if (v.startsWith('"') && v.endsWith('"')) {
            v = v.slice(1, -1).replace(/""/g, '"')
          }
          return v
        })

        let time = null
        if (isoTimeIndex !== -1 && values[isoTimeIndex]) {
          time = values[isoTimeIndex]
        } else if (timeIndex !== -1 && values[timeIndex]) {
          // Try to parse Hebrew date from 'זמן' column
          time = parseHebrewDate(values[timeIndex])
        }

        return {
          time: time,
          feedingAmount: feedingIndex !== -1 ? (parseFloat(values[feedingIndex]) || null) : null,
          sensor: sensorIndex !== -1 ? (parseFloat(values[sensorIndex]) || null) : null,
          glucometerReading: glucoseIndex !== -1 ? (parseFloat(values[glucoseIndex]) || null) : null,
          drip: dripIndex !== -1 ? (parseFloat(values[dripIndex]) || null) : null,
          nutritionType: typeIndex !== -1 ? (values[typeIndex] || null) : null,
          extra: notesIndex !== -1 ? (values[notesIndex] || null) : null
        }
      })

      // Filter out entries where time parsing failed
      const validEntries = newEntries.filter(e => e.time)

      if (validEntries.length < newEntries.length) {
        pendingImportEntries.value = validEntries
        importWarningMessage.value = `הצלחתנו לפענח רק ${validEntries.length} מתוך ${newEntries.length} שורות. האם להמשיך?`
        showImportWarningModal.value = true
        event.target.value = ''
        return
      }

      if (validEntries.length > 0) {
        await importEntries(validEntries)
        showAlert('הצלחה', 'הייבוא הושלם בהצלחה!')
      } else {
        showAlert('שגיאה', 'לא נמצאו רשומות תקינות לייבוא.')
      }

    } catch (err) {
      console.error('Import error:', err)
      showAlert('שגיאה', 'שגיאה בייבוא הקובץ: ' + err.message)
    } finally {
      event.target.value = ''
    }
  }
  reader.readAsText(file)
}

const pendingImportEntries = ref([])
const showImportWarningModal = ref(false)
const importWarningMessage = ref('')

const confirmImport = async () => {
  showImportWarningModal.value = false
  if (pendingImportEntries.value.length > 0) {
    try {
      await importEntries(pendingImportEntries.value)
      showAlert('הצלחה', 'הייבוא הושלם בהצלחה!')
    } catch (err) {
      showAlert('שגיאה', 'שגיאה בייבוא הקובץ: ' + err.message)
    }
    pendingImportEntries.value = []
  }
}

const cancelImport = () => {
  showImportWarningModal.value = false
  pendingImportEntries.value = []
}

// Delete Logic
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const { deleteConfirmationIgnored, deleteEntry: deleteEntryApi } = useAppEntries()

const handleDeleteClick = (id) => {
  if (deleteConfirmationIgnored.value) {
    deleteEntryApi(id)
  } else {
    itemToDelete.value = id
    showDeleteModal.value = true
  }
}

const confirmDelete = (dontAskAgain) => {
  if (dontAskAgain) {
    deleteConfirmationIgnored.value = true
  }
  if (itemToDelete.value) {
    deleteEntryApi(itemToDelete.value)
  }
  showDeleteModal.value = false
  itemToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
}

// Alert Logic
const showAlertModal = ref(false)
const alertTitle = ref('')
const alertMessage = ref('')

const showAlert = (title, message) => {
  alertTitle.value = title
  alertMessage.value = message
  showAlertModal.value = true
}

const closeAlert = () => {
  showAlertModal.value = false
}
</script>
