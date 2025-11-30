<template>
  <div class="space-y-6 pb-20">
    <h2 class="text-2xl font-bold">סטטיסטיקה</h2>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
        <div class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">סה״כ אוכל היום</div>
        <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ todayTotalFood }} <span class="text-sm font-normal">מ״ל</span></div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
        <div class="flex items-center justify-between mb-1">
          <div class="text-xs text-green-600 dark:text-green-400 font-medium">ממוצע גלוקוז</div>
          <select v-model.number="avgDays" class="text-xs px-2 py-1 rounded-lg bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option :value="3">3 ימים</option>
            <option :value="7">7 ימים</option>
            <option :value="14">14 ימים</option>
            <option :value="30">30 ימים</option>
          </select>
        </div>
        <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ avgGlucose7Days }}</div>
      </div>
    </div>

    <!-- Daily Intake Chart -->
    <section class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-4">צריכת מזון יומית (שבועיים אחרונים)</h3>
      <div class="chart-container">
        <canvas ref="dailyIntakeChart" class="chart-canvas"></canvas>
      </div>
    </section>

    <!-- Glucose Comparison Chart -->
    <section class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-4">השוואת חיישן מול גלוקומטר</h3>
      <div class="chart-container">
        <canvas ref="comparisonChart" class="chart-canvas"></canvas>
      </div>
    </section>

    <!-- Per-Food Glucose Chart -->
    <section class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-700 dark:text-gray-200">גלוקוז לפי מזון</h3>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <label v-for="food in foodOptions" :key="food" class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" :value="food" v-model="selectedFoods" class="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
          <span class="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">{{ food }}</span>
        </label>
      </div>

      <div class="chart-container">
        <canvas ref="perFoodChart" class="chart-canvas"></canvas>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  entries: { type: Array, default: () => [] }
})

const dailyIntakeChart = ref(null)
const comparisonChart = ref(null)
const perFoodChart = ref(null)

let dailyIntakeInstance = null
let comparisonInstance = null
let perFoodInstance = null

const isMounted = ref(false)
let rebuildQueued = false

const colorPalette = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
]

// --- Computed Stats ---
const todayTotalFood = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return props.entries
    .filter(e => e.time.startsWith(today))
    .reduce((sum, e) => sum + (Number(e.feedingAmount) || 0), 0)
})

const avgGlucose7Days = computed(() => {
  const now = new Date()
  const daysAgo = new Date(now.setDate(now.getDate() - avgDays.value))
  
  const readings = props.entries
    .filter(e => new Date(e.time) >= daysAgo && e.glucometerReading)
    .map(e => Number(e.glucometerReading))
  
  if (readings.length === 0) return '-'
  const sum = readings.reduce((a, b) => a + b, 0)
  return Math.round(sum / readings.length)
})

const foodOptions = computed(() => {
  const set = new Set()
  props.entries.forEach(e => {
    if (e.nutritionType) set.add(e.nutritionType)
  })
  return Array.from(set).sort()
})

const selectedFoods = ref([])
const avgDays = ref(7)

watch(foodOptions, (opts) => {
  if (selectedFoods.value.length === 0 && opts.length > 0) {
    selectedFoods.value = opts.slice(0, 3) // Select first 3 by default
  }
}, { immediate: true })

// --- Chart Building ---

function scheduleBuild() {
  if (rebuildQueued) return
  rebuildQueued = true
  requestAnimationFrame(async () => {
    rebuildQueued = false
    await nextTick()
    if (!isMounted.value) return
    buildCharts()
  })
}

watch(() => props.entries, scheduleBuild, { deep: true })
watch(selectedFoods, scheduleBuild, { deep: true })

function buildCharts() {
  if (!isMounted.value) return
  buildDailyIntakeChart()
  buildComparisonChart()
  buildPerFoodChart()
}

function buildDailyIntakeChart() {
  if (!dailyIntakeChart.value) return
  const ctx = dailyIntakeChart.value.getContext('2d')
  
  // Group by day (last 14 days)
  const days = {}
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days[d.toISOString().slice(0, 10)] = 0
  }

  props.entries.forEach(e => {
    const day = e.time.slice(0, 10)
    if (days[day] !== undefined) {
      days[day] += (Number(e.feedingAmount) || 0)
    }
  })

  const labels = Object.keys(days).map(d => d.slice(5)) // MM-DD
  const data = Object.values(days)

  if (dailyIntakeInstance) dailyIntakeInstance.destroy()
  
  dailyIntakeInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'כמות (מ״ל)',
        data,
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })
}

function buildComparisonChart() {
  if (!comparisonChart.value) return
  const ctx = comparisonChart.value.getContext('2d')

  const sorted = [...props.entries].sort((a, b) => new Date(a.time) - new Date(b.time))
  const labels = sorted.map(e => new Date(e.time).toLocaleString('he-IL', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
  
  const glucoData = sorted.map(e => e.glucometerReading)
  const sensorData = sorted.map(e => e.sensor)

  if (comparisonInstance) comparisonInstance.destroy()

  comparisonInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'גלוקומטר',
          data: glucoData,
          borderColor: '#10b981', // Green
          backgroundColor: '#10b981',
          pointRadius: 3,
          tension: 0.2,
          spanGaps: true
        },
        {
          label: 'חיישן',
          data: sensorData,
          borderColor: '#8b5cf6', // Purple
          backgroundColor: '#8b5cf6',
          pointRadius: 3,
          tension: 0.2,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } }
    }
  })
}

function buildPerFoodChart() {
  if (!perFoodChart.value) return
  const ctx = perFoodChart.value.getContext('2d')

  const sorted = [...props.entries].sort((a, b) => new Date(a.time) - new Date(b.time))
  const labels = sorted.map(e => new Date(e.time).toISOString()) // Use ISO for mapping, format in tooltip if needed

  const byFood = {}
  sorted.forEach(e => {
    const key = e.nutritionType
    if (!key) return
    if (!byFood[key]) byFood[key] = []
    byFood[key].push({ time: new Date(e.time).toISOString(), value: e.glucometerReading })
  })

  const datasets = Object.keys(byFood)
    .filter(food => selectedFoods.value.includes(food))
    .map((food, i) => {
      const map = new Map(byFood[food].map(item => [item.time, item.value]))
      // Map back to global timeline (sparse data)
      const data = labels.map(l => map.get(l) ?? null)
      return {
        label: food,
        data,
        borderColor: colorPalette[i % colorPalette.length],
        backgroundColor: colorPalette[i % colorPalette.length],
        tension: 0.2,
        spanGaps: true,
        pointRadius: 3
      }
    })

  if (perFoodInstance) perFoodInstance.destroy()

  perFoodInstance = new Chart(ctx, {
    type: 'line',
    data: { 
      labels: sorted.map(e => new Date(e.time).toLocaleString('he-IL', { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })), 
      datasets 
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: false } }
    }
  })
}

onMounted(async () => {
  isMounted.value = true
  await nextTick()
  buildCharts()
})

onBeforeUnmount(() => {
  isMounted.value = false
  if (dailyIntakeInstance) dailyIntakeInstance.destroy()
  if (comparisonInstance) comparisonInstance.destroy()
  if (perFoodInstance) perFoodInstance.destroy()
})
</script>

<style scoped>
.chart-container {
  height: 250px;
  position: relative;
  width: 100%;
}
</style>
