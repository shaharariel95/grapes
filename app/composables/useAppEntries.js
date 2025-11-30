import { ref, onMounted } from 'vue'


// --- State ---
const entries = ref([])
const editingId = ref(null)
const formKey = ref(Date.now()) // Used to force form reset
const loading = ref(false)
const error = ref(null)
const deleteConfirmationIgnored = ref(false)

// --- API Functions ---
const fetchEntries = async () => {
	if (!process.client) return // Only fetch on client side

	loading.value = true
	error.value = null
	try {
		const data = await $fetch('/api/entries')
		console.log('Fetched entries:', data)
		entries.value = data.entries || []
		console.log('Fetched entries.value:', entries.value)
	} catch (err) {
		console.error('Failed to fetch entries:', err)
		error.value = 'Failed to load entries'
	} finally {
		loading.value = false
	}
}

const importEntries = async (newEntries) => {
	loading.value = true
	error.value = null
	try {
		const response = await $fetch('/api/entries/bulk', {
			method: 'POST',
			body: newEntries
		})

		// Refresh entries after successful import
		await fetchEntries()
		return response
	} catch (err) {
		console.error('Failed to import entries:', err)
		error.value = 'Failed to import entries'
		throw err
	} finally {
		loading.value = false
	}
}

// --- Entry Logic ---
const getEntryById = (id) => {
	return entries.value.find(e => e.id === id) || null
}

const handleSave = async (payload) => {
	loading.value = true
	error.value = null

	try {
		if (editingId.value) {
			// Update existing entry
			const response = await $fetch('/api/entries', {
				method: 'PUT',
				body: { ...payload, id: editingId.value }
			})

			// Update local state
			const index = entries.value.findIndex(e => e.id === editingId.value)
			if (index !== -1) {
				entries.value[index] = response.entry
			}
			editingId.value = null
		} else {
			// Create new entry
			const response = await $fetch('/api/entries', {
				method: 'POST',
				body: payload
			})

			// Add to local state
			entries.value.unshift(response.entry)
		}

		// Force form remount to reset values
		formKey.value = Date.now()
		// After saving, redirect to history page using Nuxt's navigateTo
		await navigateTo('/history')
	} catch (err) {
		console.error('Failed to save entry:', err)
		error.value = 'Failed to save entry'
	} finally {
		loading.value = false
	}
}

const startEdit = (entry) => {
	editingId.value = entry.id
	// Navigate to the form page when editing
	navigateTo('/')
}

const cancelEdit = () => {
	editingId.value = null
	formKey.value = Date.now()
	// Navigate back to history or stay on form
}

const deleteEntry = async (id) => {
	// Note: Confirmation logic is now handled in the UI component or checked here if ignored.
	// If called directly without UI check, it will just delete.
	// But we want to support the "Don't ask again" check here?
	// Actually, the UI should check `deleteConfirmationIgnored`.
	// If it's true, UI calls this directly.
	// If it's false, UI shows modal.
	// So this function just does the deletion.

	if (process.client) {
		loading.value = true
		error.value = null

		try {
			await $fetch(`/api/entries?id=${id}`, {
				method: 'DELETE'
			})

			// Remove from local state
			entries.value = entries.value.filter(e => e.id !== id)
		} catch (err) {
			console.error('Failed to delete entry:', err)
			error.value = 'Failed to delete entry'
		} finally {
			loading.value = false
		}
	}
}

// --- Initialization ---
onMounted(() => {
	fetchEntries()
})


export function useAppEntries() {
	return {
		entries,
		editingId,
		formKey,
		loading,
		error,
		deleteConfirmationIgnored,
		getEntryById,
		handleSave,
		startEdit,
		cancelEdit,
		deleteEntry,
		fetchEntries,
		importEntries,
	}
}