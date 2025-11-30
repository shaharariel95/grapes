<template>
  <ClientOnly>
    <div class="min-h-screen min-w-full w-full">
      <div
        class="min-h-screen min-w-full w-full rounded-xl bg-slate-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors pb-20">
        <AppHeader v-if="route.path !== '/login'" :is-dark="isDarkMode" @toggle-theme="toggleTheme"
          @open-settings="showSettings = true" @logout="handleLogout" />

        <main class="max-w-4xl mx-auto px-4 py-6 w-full">
          <NuxtPage />
        </main>

        <BottomNav v-if="route.path !== '/login'" :current-page="currentRouteName" @change-page="navigateTo($event)" />

        <SettingsModal v-if="showSettings" @close="showSettings = false" />
      </div>
    </div>
    <template #fallback>
      <div class="min-h-screen min-w-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-gray-900">
        <div class="animate-pulse text-gray-600 dark:text-gray-400">טוען...</div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
// Components are auto-imported!

const showSettings = ref(false)
const isDarkMode = ref(false)

// Use Nuxt's useRoute composable for routing info
const route = useRoute()
const currentRouteName = computed(() => {
  // Map Nuxt routes to your BottomNav page names
  switch (route.path) {
    case '/history': return 'history'
    case '/stats': return 'stats'
    default: return '/'
  }
})

// --- Theme Logic (from old App.vue) ---
const toggleTheme = () => {
  console.log('toggleTheme called. Old state:', isDarkMode.value)
  isDarkMode.value = !isDarkMode.value
  console.log('New state:', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  console.log('Class list:', document.documentElement.classList)
}

const loadTheme = () => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }
}

onMounted(() => {
  loadTheme()
})

// Optional: Pre-load the entries so they're available immediately
useAppEntries()

const { logout } = useAuth()
const handleLogout = async () => {
  await logout()
}
</script>