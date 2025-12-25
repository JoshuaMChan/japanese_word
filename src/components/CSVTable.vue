<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {parseCSV, CSVData} from '../utils/csvParser'

interface Props {
  id: string
  displayName: string
}

const props = defineProps<Props>()

const csvData = ref<CSVData>({headers: [], rows: []})
const loading = ref(true)
const error = ref<string | null>(null)

// ===== Search =====
const searchQuery = ref('')

// Filter rows based on search query
const filteredRows = computed(() => {
  if (!searchQuery.value.trim()) {
    return csvData.value.rows
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return csvData.value.rows.filter(row => {
    // Search in all cells of the row (search raw cell content)
    return row.some(cell => {
      if (!cell) return false
      // Remove ＊ markers for search, but keep the text
      const searchableText = cell.replace(/＊/g, '').toLowerCase()
      return searchableText.includes(query)
    })
  })
})

// Use Vite's glob import to preload all CSV files
const csvModules = import.meta.glob('../assets/csvs/*.csv', {
  eager: false,
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

// Process cell content to replace / with line breaks and handle ＊
const processCell = (cell: string | undefined): string => {
  if (!cell) return ''
  let processed = cell.replace(/\//g, '<br>')
  // Replace text between ＊ with red text styling and remove the ＊
  // First, handle text between two ＊ characters (e.g., ＊text＊)
  processed = processed.replace(/＊([^＊]*)＊/g, '<span class="csv-red-text">$1</span>')
  // Then, handle single ＊ at the end (legacy format: text＊)
  processed = processed.replace(/([^<]*?)＊(?!.*<)/g, '<span class="csv-red-text">$1</span>')
  return processed
}

onMounted(async () => {
  try {
    // Build file path (needs to match glob pattern)
    const filePath = `../assets/csvs/${props.id}.csv`

    // Get the corresponding module loader from glob import
    const moduleLoader = csvModules[filePath]

    if (!moduleLoader) {
      throw new Error(`File not found: ${props.id}.csv (path: ${filePath})`)
    }

    // Load module
    const csvText = await moduleLoader()
    csvData.value = parseCSV(csvText)
    loading.value = false
  } catch (err) {
    error.value = `Failed to load file: ${props.id}.csv`
    loading.value = false
    console.error('CSV loading error:', err)
    console.error('Available files:', Object.keys(csvModules))
  }
})
</script>

<template>
  <div v-if="loading" class="csv-loading">Loading...</div>
  <div v-else-if="error" class="csv-error">{{ error }}</div>
  <div v-else class="layout">
    <div class="layout-main">
      <!-- Search Input -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="検索..."
        />
        <span v-if="searchQuery" class="search-results">
          {{ filteredRows.length }} / {{ csvData.rows.length }}
        </span>
      </div>
      
      <table class="styled-table sortable">
        <thead>
        <tr>
          <th v-for="(header, idx) in csvData.headers" :key="idx">
            {{ header }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, rowIdx) in filteredRows" :key="rowIdx">
          <td v-for="(header, headerIdx) in csvData.headers" :key="headerIdx" class="csv-cell">
            <span class="csv-cell-content" v-html="processCell(row[headerIdx])"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.csv-loading,
.csv-error {
  padding: 20px;
  text-align: center;
  color: #666;
}

.csv-error {
  color: #d32f2f;
}

.csv-cell {
  vertical-align: middle;
}

.csv-cell-content {
  display: block;
  line-height: 1.8;
  font-weight: bold;
  font-size: 15px;
}

:deep(.csv-red-text) {
  color: red !important;
}
</style>

