import { reactive, watch } from 'vue'

const SETTINGS_KEY = 'geffen_settings'

const defaultSettings = {
    feedingAmount: { min: 20, max: 150, step: 5 },
    sensor: { min: 40, max: 400, step: 1 },
    glucometer: { min: 40, max: 400, step: 1 },
    drip: { min: 0, max: 100, step: 1 }
}

const settings = reactive({ ...defaultSettings })

const loadSettings = () => {
    if (process.client) {
        const saved = localStorage.getItem(SETTINGS_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                Object.assign(settings, { ...defaultSettings, ...parsed })
            } catch (e) {
                console.error('Failed to parse settings', e)
            }
        }
    }
}

const saveSettings = () => {
    if (process.client) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }
}

// Load immediately
loadSettings()

// Watch for changes and save
watch(settings, () => {
    saveSettings()
}, { deep: true })

export function useSettings() {
    return {
        settings,
        resetSettings: () => Object.assign(settings, defaultSettings)
    }
}
