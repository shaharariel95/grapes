<template>
  <div>
    <HistoryList
      :entries="entries.value"
      @edit-entry="startEdit"
      @delete-entry="deleteEntry"
    />
  </div>
</template>

<script setup>
// Auto-imported components: HistoryList
// Auto-imported composables: useAppEntries

const { 
  fetchEntries, 
  entries,
  startEdit, 
  deleteEntry 
} = useAppEntries()

useHead({
  title: 'היסטוריית האכלה',
})

onMounted(() => {
//   entries = fetchEntries()
const data = fetchEntries();
entries.value = data.entries;
})
</script>