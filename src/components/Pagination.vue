<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  visiblePagesAtStart?: number  // Number of pages to show at the beginning (default: 5)
  visiblePagesAtEnd?: number    // Number of pages to show at the end (default: 3)
  jumpPages?: number            // Number of pages to jump when clicking -/+ buttons (default: 10)
}

const props = withDefaults(defineProps<Props>(), {
  visiblePagesAtStart: 5,
  visiblePagesAtEnd: 3,
  jumpPages: 10
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

// ===== Computed Pages to Display =====
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages } = props
  
  if (totalPages <= 7) {
    // If 7 or fewer pages, show all
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }
  
  // Always show page 1
  pages.push(1)
  
  // Calculate the range around current page (2 pages before and after)
  const rangeStart = Math.max(2, currentPage - 2)
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2)
  
  // If there's a gap between page 1 and the range, add ellipsis
  if (rangeStart > 2) {
    pages.push('...')
  }
  
  // Add pages in the range around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }
  
  // If there's a gap between the range and last page, add ellipsis
  if (rangeEnd < totalPages - 1) {
    pages.push('...')
  }
  
  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages)
  }
  
  return pages
})

// ===== Navigation Functions =====
const goToPage = (page: number) => {
  const targetPage = Math.max(1, Math.min(page, props.totalPages))
  emit('update:currentPage', targetPage)
}

const goToPrevJump = () => goToPage(props.currentPage - props.jumpPages)
const goToNextJump = () => goToPage(props.currentPage + props.jumpPages)

// ===== Page Input =====
const pageInput = ref('')
const pageInputWidth = ref('10.5ch')

const handlePageInput = () => {
  const pageNum = parseInt(pageInput.value)
  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= props.totalPages) {
    goToPage(pageNum)
    pageInput.value = ''
    pageInputWidth.value = '10.5ch'
  }
}

const updateInputWidth = () => {
  if (pageInput.value) {
    const length = pageInput.value.length
    // Calculate width based on content length, minimum 3ch per digit
    pageInputWidth.value = `${Math.max(length * 1.2, 3)}ch`
  } else {
    pageInputWidth.value = '10.5ch'
  }
}

watch(pageInput, updateInputWidth)
</script>

<template>
  <div class="pagination-container">
    
    <div class="pagination-controls">
      <button 
        v-if="totalPages >= jumpPages"
        type="button" 
        class="pagination-btn pagination-icon-btn pagination-double-arrow pagination-double-arrow-left"
        :disabled="currentPage <= jumpPages"
        @click="goToPrevJump"
        :title="`-${jumpPages} ページ`"
      >
      </button>
      
      <!-- Page Number Buttons -->
      <template v-for="(page, idx) in visiblePages" :key="idx">
        <button
          v-if="page !== '...'"
          type="button"
          class="pagination-btn pagination-page-btn"
          :class="{ active: page === currentPage }"
          @click="goToPage(page as number)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </template>
      
      <button 
        v-if="totalPages >= jumpPages"
        type="button" 
        class="pagination-btn pagination-icon-btn pagination-double-arrow pagination-double-arrow-right"
        :disabled="currentPage + jumpPages > totalPages"
        @click="goToNextJump"
        :title="`+${jumpPages} ページ`"
      >
      </button>
      
      <!-- Page Input (moved to same row) -->
      <div class="pagination-page-input">
        <input
          v-model="pageInput"
          type="number"
          class="page-input"
          :style="{ width: pageInputWidth }"
          :min="1"
          :max="totalPages"
          placeholder="ページ"
          @keyup.enter="handlePageInput"
          @input="updateInputWidth"
        />
        <button 
          type="button" 
          class="pagination-btn pagination-btn-small pagination-go-btn"
          @click="handlePageInput"
          title="移動"
        >
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-container {
  margin-top: 20px;
  padding: 15px;
  border-top: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  min-width: 50px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #009879;
  background-color: #f0f9f7;
  color: #009879;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page-btn {
  min-width: 40px;
}

.pagination-page-btn.active {
  border-color: #009879;
  background-color: #009879;
  color: #fff;
  font-weight: 600;
}

.pagination-ellipsis {
  padding: 0 4px;
  color: #999;
  font-size: 13px;
}

.pagination-btn-small {
  padding: 6px 10px;
  min-width: auto;
  font-size: 12px;
}

.pagination-icon-btn {
  font-size: 16px;
  line-height: 1;
  padding: 6px 10px;
}

/* Double arrow buttons (<< and >>) */
.pagination-double-arrow {
  position: relative;
  width: 40px;
  height: 32px;
  padding: 0;
}

.pagination-double-arrow::before,
.pagination-double-arrow::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  border-style: solid;
  transform: translateY(-50%);
}

.pagination-double-arrow-left::before {
  left: 8px;
  border-width: 5px 6px 5px 0;
  border-color: transparent #333 transparent transparent;
}

.pagination-double-arrow-left::after {
  left: 14px;
  border-width: 5px 6px 5px 0;
  border-color: transparent #333 transparent transparent;
}

.pagination-double-arrow-right::before {
  right: 14px;
  border-width: 5px 0 5px 6px;
  border-color: transparent transparent transparent #333;
}

.pagination-double-arrow-right::after {
  right: 8px;
  border-width: 5px 0 5px 6px;
  border-color: transparent transparent transparent #333;
}

.pagination-double-arrow-left:hover:not(:disabled)::before,
.pagination-double-arrow-left:hover:not(:disabled)::after {
  border-color: transparent #009879 transparent transparent;
}

.pagination-double-arrow-right:hover:not(:disabled)::before,
.pagination-double-arrow-right:hover:not(:disabled)::after {
  border-color: transparent transparent transparent #009879;
}

.pagination-double-arrow:disabled::before,
.pagination-double-arrow:disabled::after {
  opacity: 0.3;
}

/* Go button (single arrow) */
.pagination-go-btn {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
}

.pagination-go-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 0 5px 8px;
  border-color: transparent transparent transparent #333;
  transform: translate(-30%, -50%);
}

.pagination-go-btn:hover:not(:disabled)::after {
  border-color: transparent transparent transparent #009879;
}

.pagination-go-btn:disabled::after {
  opacity: 0.3;
}

.pagination-page-input {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px; /* Add spacing from previous button */
}

.page-input {
  min-width: 3ch;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  outline: none;
  transition: width 0.2s;
}

.page-input:focus {
  border-color: #009879;
  box-shadow: 0 0 0 2px rgba(0, 152, 121, 0.1);
}
</style>

