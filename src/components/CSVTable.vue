<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed, watch} from 'vue'
import {parseCSV, CSVData} from '../utils/csvParser'
import { romajiToHiragana, containsRomaji } from '../utils/romajiToKana'
import { setCookie, getCookie } from '../utils/cookies'
import Pagination from './Pagination.vue'
import GojuuonPanel from './GojuuonPanel.vue'
import SearchInput from './SearchInput.vue'

interface Props {
  id: string
  displayName: string
  showGojuuon?: boolean
  gojuuonFilterColumn?: number
}

const props = withDefaults(defineProps<Props>(), {
  showGojuuon: false,
  gojuuonFilterColumn: 0
})

const csvData = ref<CSVData>({headers: [], rows: []})
const loading = ref(true)
const error = ref<string | null>(null)


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
  
  // Gojuuon filter (filter by first character of specified column)
  if (selectedGojuuon.value) {
    result = result.filter(row => {
      const filterCell = row[props.gojuuonFilterColumn] || ''
      const normalizedCell = filterCell.replace(/＊/g, '').trim()
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

// ===== Compute rows filtered by all filters except Gojuuon =====
// This is used to determine which Gojuuon buttons should be disabled
const rowsWithoutGojuuonFilter = computed(() => {
  let result = csvData.value.rows
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    const kanaQuery = containsRomaji(query) ? romajiToHiragana(query) : query
    
    result = result.filter(row =>
      row.some(cell => matchesCellContent(cell, query, kanaQuery))
    )
  }
  
  // Note: Gojuuon filter is intentionally excluded here
  
  return result
})

// ===== Compute which Gojuuon characters have results =====
const gojuuonAvailability = computed(() => {
  const availability: Record<string, boolean> = {}
  const GOJUUON_CHARS = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'が', 'ぎ', 'ぐ', 'げ', 'ご',
    'さ', 'し', 'す', 'せ', 'そ',
    'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
    'た', 'ち', 'つ', 'て', 'と',
    'だ', 'ぢ', 'づ', 'で', 'ど',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ば', 'び', 'ぶ', 'べ', 'ぼ',
    'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん',
  ]
  
  GOJUUON_CHARS.forEach(char => {
    availability[char] = rowsWithoutGojuuonFilter.value.some(row => {
      const filterCell = row[props.gojuuonFilterColumn] || ''
      const normalizedCell = filterCell.replace(/＊/g, '').trim()
      return normalizedCell.startsWith(char)
    })
  })
  
  return availability
})

// ===== Pagination State =====
const currentPage = ref(1)

// ===== Cookie Management =====
const COOKIE_PREFIX = `tab_${props.id}_`

const saveStateToCookie = () => {
  setCookie(`${COOKIE_PREFIX}search`, searchQuery.value)
  setCookie(`${COOKIE_PREFIX}gojuuon`, selectedGojuuon.value)
  setCookie(`${COOKIE_PREFIX}page`, currentPage.value.toString())
}

const loadStateFromCookie = () => {
  const savedSearch = getCookie(`${COOKIE_PREFIX}search`)
  const savedGojuuon = getCookie(`${COOKIE_PREFIX}gojuuon`)
  const savedPage = getCookie(`${COOKIE_PREFIX}page`)
  
  if (savedSearch !== null) searchQuery.value = savedSearch
  if (savedGojuuon !== null) selectedGojuuon.value = savedGojuuon
  if (savedPage !== null) {
    const page = parseInt(savedPage, 10)
    if (!isNaN(page) && page > 0) currentPage.value = page
  }
}

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

// ===== Keyboard navigation =====
const isInputElement = (target: EventTarget | null): boolean => {
  return target instanceof HTMLInputElement ||
         target instanceof HTMLTextAreaElement ||
         target instanceof HTMLSelectElement
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (isInputElement(event.target)) return
  
  if (event.key === 'ArrowLeft') {
    // Navigate to previous page if pagination is active
    if (filteredRows.value.length > ROWS_PER_PAGE && currentPage.value > 1) {
      event.preventDefault()
      currentPage.value--
    }
  } else if (event.key === 'ArrowRight') {
    // Navigate to next page if pagination is active
    if (filteredRows.value.length > ROWS_PER_PAGE && currentPage.value < totalPages.value) {
      event.preventDefault()
      currentPage.value++
    }
  }
}

// Watch for state changes and save to cookies (set up before onMounted)
let isLoadingFromCookie = false
watch([searchQuery, selectedGojuuon, currentPage], () => {
  if (!isLoadingFromCookie) {
    saveStateToCookie()
  }
}, { deep: true })

onMounted(async () => {
  // Load state from cookies
  isLoadingFromCookie = true
  loadStateFromCookie()
  isLoadingFromCookie = false
  
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown)
  
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

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div v-if="loading" class="csv-loading">Loading...</div>
  <div v-else-if="error" class="csv-error">{{ error }}</div>
  <div v-else class="layout">
    <div class="layout-main">
      <!-- Search Input -->
      <SearchInput
        v-model="searchQuery"
        :show-results="true"
        :filtered-count="filteredRows.length"
        :total-count="csvData.rows.length"
      />
      
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
        <GojuuonPanel v-model="selectedGojuuon" :disabled-chars="gojuuonAvailability" />
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

