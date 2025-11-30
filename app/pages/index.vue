<template>
  <div>
    <ClientOnly>
      <EntryForm :key="formKey" :initial="editingId ? getEntryById(editingId) : null" :editing-id="editingId"
        :existing-entries="entries" @save="handleSave" @cancel="cancelEdit" />
    </ClientOnly>
  </div>
</template>

<script setup>
// Auto-imported components: EntryForm
// Auto-imported composables: useAppEntries
const {
  entries,
  editingId,
  formKey,
  getEntryById,
  handleSave,
  cancelEdit
} = useAppEntries()

// Set the page title
useHead({
  title: editingId.value ? 'ערוך רשומה' : 'הוסף רשומה חדשה',
})
</script>