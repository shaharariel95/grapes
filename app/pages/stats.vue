<template>
  <div>
    <Statistics :entries="entries" />
  </div>
</template>

<script setup>
// Auto-imported components: Statistics
// Auto-imported composables: useAppEntries
const { entries } = useAppEntries()

useHead({
  title: 'סטטיסטיקה',
})
</script>