<template>
  <tr v-if="show" class="data-table-group-repeat-header">
    <th
      v-for="col in columns"
      :key="String(col.key ?? col.value ?? col.title)"
      scope="col"
      class="data-table-group-repeat-header__th"
    >
      {{ col.title }}
    </th>
  </tr>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="sass" scoped>
.data-table-group-repeat-header
  background: rgba(var(--v-theme-surface-variant), 0.35)

.data-table-group-repeat-header__th
  font-size: 0.75rem
  font-weight: 600
  text-align: start
  padding: 8px 16px
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity))
  white-space: nowrap
</style>
