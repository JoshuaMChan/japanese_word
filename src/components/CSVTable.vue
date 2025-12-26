<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue'
import {parseCSV, CSVData} from '../utils/csvParser'
import { romajiToHiragana, containsRomaji } from '../utils/romajiToKana'
import Pagination from './Pagination.vue'

interface Props {
  id: string
  displayName: string
  showGojuuon?: boolean
}

const props = defineProps<Props>()

const csvData = ref<CSVData>({headers: [], rows: []})
const loading = ref(true)
const error = ref<string | null>(null)

// ===== Gojuuon (50 Sounds) =====
const GOJUUON_ROWS = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', 'ゆ', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'を', 'ん'],
] as const

const GOJUUON_CHARS = GOJUUON_ROWS.flat()

// ===== Search =====
const searchQuery = ref('')
const selectedGojuuon = ref<string>('')

// ===== Helper Functions =====
const normalizeCellForSearch = (cell: string): string => {
  return cell.replace(/＊/g, '').toLowerCase()
}

const matchesCellContent = (cell: string, query: string, kanaQuery: string): boolean => {
  if (!cell) return false
  const searchableText = normalizeCellForSearch(cell)
  return searchableText.includes(query) || searchableText.includes(kanaQuery)
}

// ===== Pagination Configuration =====
const ROWS_PER_PAGE = 10 // Define rows per page here
const VISIBLE_PAGES_AT_START = 5 // Number of pages to show at the beginning
const VISIBLE_PAGES_AT_END = 3 // Number of pages to show at the end
const JUMP_PAGES = 10 // Number of pages to jump when clicking -/+ buttons

// ===== Filter rows based on search query and Gojuuon =====
const filteredRows = computed(() => {
  let result = csvData.value.rows
  
  // Gojuuon filter (filter by first character of first cell)
  if (selectedGojuuon.value) {
    result = result.filter(row => {
      const firstCell = row[0] || ''
      const normalizedCell = firstCell.replace(/＊/g, '').trim()
      return normalizedCell.startsWith(selectedGojuuon.value)
    })
  }
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    const kanaQuery = containsRomaji(query) ? romajiToHiragana(query) : query
    
    result = result.filter(row =>
      row.some(cell => matchesCellContent(cell, query, kanaQuery))
    )
  }
  
  return result
})

// ===== Pagination State =====
const currentPage = ref(1)

// ===== Pagination Computed =====
const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / ROWS_PER_PAGE)
})

const paginatedRows = computed(() => {
  if (filteredRows.value.length <= ROWS_PER_PAGE) {
    return filteredRows.value
  }
  
  const start = (currentPage.value - 1) * ROWS_PER_PAGE
  const end = start + ROWS_PER_PAGE
  return filteredRows.value.slice(start, end)
})

// Reset to page 1 when filters change
watch([searchQuery, selectedGojuuon], () => {
  currentPage.value = 1
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
        <span v-if="searchQuery || selectedGojuuon" class="search-results">
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
        <tr v-for="(row, rowIdx) in paginatedRows" :key="rowIdx">
          <td v-for="(header, headerIdx) in csvData.headers" :key="headerIdx" class="csv-cell">
            <span class="csv-cell-content" v-html="processCell(row[headerIdx])"></span>
          </td>
        </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <Pagination
        v-if="filteredRows.length > ROWS_PER_PAGE"
        v-model:currentPage="currentPage"
        :totalPages="totalPages"
        :visiblePagesAtStart="VISIBLE_PAGES_AT_START"
        :visiblePagesAtEnd="VISIBLE_PAGES_AT_END"
        :jumpPages="JUMP_PAGES"
      />
    </div>
    
    <!-- Right: Gojuuon Filter Panel -->
    <aside v-if="showGojuuon" class="layout-sidebar">
      <div class="sidebar-section">
        <div class="gojuuon-panel">
          <div
              v-for="(row, rowIdx) in GOJUUON_ROWS"
              :key="rowIdx"
              class="gojuuon-row"
              :class="{ 'gojuuon-row-3': row.length === 3 }"
          >
            <button
                v-for="(char, charIdx) in row"
                :key="char"
                type="button"
                class="gojuuon-btn"
                :class="{ 
                  active: selectedGojuuon === char,
                  'gojuuon-btn-3-pos': row.length === 3 && (charIdx === 0 || charIdx === 1 || charIdx === 2)
                }"
                @click="selectedGojuuon = selectedGojuuon === char ? '' : char"
            >
              {{ char }}
            </button>
          </div>
        </div>
      </div>
    </aside>
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

