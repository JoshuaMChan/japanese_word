<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  showResults?: boolean
  filteredCount?: number
  totalCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  showResults: false,
  filteredCount: 0,
  totalCount: 0
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="search-container">
    <input
      v-model="searchQuery"
      type="text"
      class="search-input"
      placeholder="検索..."
    />
    <span v-if="showResults && (searchQuery || (filteredCount !== totalCount && filteredCount > 0))" class="search-results">
      {{ filteredCount }} / {{ totalCount }}
    </span>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  width: 300px;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #009879;
  box-shadow: 0 0 0 2px rgba(0, 152, 121, 0.1);
}

.search-results {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}
</style>

