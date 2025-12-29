<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import verbs from '../assets/verbs.json'
import { Verb } from '../types/verb'
import { accentSegments } from '../utils/accent'
import { conjugate, Conjugation } from '../utils/conjugation.ts'
import { TRANSITIVITY_JA } from '../constants/transitivity'
import { iStem } from '../utils/gotan'
import { romajiToHiragana, containsRomaji } from '../utils/romajiToKana'
import Pagination from './Pagination.vue'
import GojuuonPanel from './GojuuonPanel.vue'
import SearchInput from './SearchInput.vue'

const vocabulary = verbs as Verb[]

// ===== Conjugation Class Japanese Labels =====
const CONJ_CLASS_JA: Record<string, string> = {
  'GODAN': '五段',
  'KAMI_ICHIDAN': '上一段',
  'SHIMO_ICHIDAN': '下一段',
  'SAHEN': 'サ変',
  'KAHEN': 'カ変',
}

// Define order for conjugation classes
const CONJ_CLASS_ORDER = Object.keys(CONJ_CLASS_JA)

// ===== Helper: Sort by defined order =====
const sortByDefinedOrder = <T extends string>(
  items: Set<T>,
  definedOrder: readonly T[]
): T[] => {
  const ordered: T[] = []
  const unordered: T[] = []
  
  definedOrder.forEach(item => {
    if (items.has(item)) ordered.push(item)
  })
  
  items.forEach(item => {
    if (!definedOrder.includes(item)) unordered.push(item)
  })
  
  return [...ordered, ...unordered.sort()]
}

// ===== Get unique filter values =====
const uniqueConjClasses = computed(() => {
  const classes = new Set<string>()
  vocabulary.forEach(v => classes.add(v.conjClass))
  return sortByDefinedOrder(classes, CONJ_CLASS_ORDER)
})

// Transitivity filter only has VI and VT options (VIT is always shown)
const transitivityOptions = ['VI', 'VT'] as const

// ===== Accent Japanese Labels =====
const ACCENT_JA: Record<string, string> = {
  'ATA': '頭高',
  'NAKA': '中高',
  'ODA': '尾高',
  'HEI': '平板',
}

// Define order for accents
const ACCENT_ORDER = Object.keys(ACCENT_JA)

const uniqueAccents = computed(() => {
  const accents = new Set<string>()
  vocabulary.forEach(v => v.accent.forEach(acc => accents.add(acc)))
  return sortByDefinedOrder(accents, ACCENT_ORDER)
})


// ===== Filter State =====
const searchQuery = ref('')
const selectedConjClass = ref<string>('')
const selectedTransitivity = ref<string>('')
const selectedAccent = ref<string>('')
const selectedGojuuon = ref<string>('')

// ===== Helper Functions =====
const matchesSearchQuery = (verb: Verb, query: string, kanaQuery: string): boolean => {
  const originalKana = (verb.kanaStart + verb.kanaEnd).toLowerCase()
  if (originalKana.includes(query) || originalKana.includes(kanaQuery)) return true
  
  if (verb.kanjiStart?.some(kanji => kanji.includes(query) || kanji.includes(kanaQuery))) {
    return true
  }
  
  const conjugated = conjugate(verb, conjugation.value)
  const conjugatedKana = (conjugated.kanaStart + conjugated.kanaEnd).toLowerCase()
  if (conjugatedKana.includes(query) || conjugatedKana.includes(kanaQuery)) return true
  
  if (conjugated.kanjiStart?.some(kanji => kanji.includes(query) || kanji.includes(kanaQuery))) {
    return true
  }
  
  return false
}

const matchesTransitivity = (verb: Verb, selected: string): boolean => {
  if (verb.transitivity === 'VIT') return true
  return verb.transitivity === selected
}

// ===== Pagination Configuration =====
const ROWS_PER_PAGE = 10 // Define rows per page here
const VISIBLE_PAGES_AT_START = 10 // Number of pages to show at the beginning
const VISIBLE_PAGES_AT_END = 3 // Number of pages to show at the end
const JUMP_PAGES = 10 // Number of pages to jump when clicking -/+ buttons

// ===== Filter vocabulary based on all filters =====
const filteredVocabulary = computed(() => {
  let result = vocabulary
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    const kanaQuery = containsRomaji(query) ? romajiToHiragana(query) : query
    
    result = result.filter(v => matchesSearchQuery(v, query, kanaQuery))
  }
  
  // Conjugation class filter
  if (selectedConjClass.value) {
    result = result.filter(v => v.conjClass === selectedConjClass.value)
  }
  
  // Transitivity filter
  if (selectedTransitivity.value) {
    result = result.filter(v => matchesTransitivity(v, selectedTransitivity.value))
  }
  
  // Accent filter
  if (selectedAccent.value) {
    result = result.filter(v => v.accent.includes(selectedAccent.value))
  }
  
  // Gojuuon filter (filter by first character of kanaStart)
  if (selectedGojuuon.value) {
    result = result.filter(v => v.kanaStart.startsWith(selectedGojuuon.value))
  }
  
  return result
})

// ===== Compute vocabulary filtered by all filters except Gojuuon =====
// This is used to determine which Gojuuon buttons should be disabled
const vocabularyWithoutGojuuonFilter = computed(() => {
  let result = vocabulary
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    const kanaQuery = containsRomaji(query) ? romajiToHiragana(query) : query
    result = result.filter(v => matchesSearchQuery(v, query, kanaQuery))
  }
  
  // Conjugation class filter
  if (selectedConjClass.value) {
    result = result.filter(v => v.conjClass === selectedConjClass.value)
  }
  
  // Transitivity filter
  if (selectedTransitivity.value) {
    result = result.filter(v => matchesTransitivity(v, selectedTransitivity.value))
  }
  
  // Accent filter
  if (selectedAccent.value) {
    result = result.filter(v => v.accent.includes(selectedAccent.value))
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
    availability[char] = vocabularyWithoutGojuuonFilter.value.some(
      v => v.kanaStart.startsWith(char)
    )
  })
  
  return availability
})

// ===== Pagination State =====
const currentPage = ref(1)

// ===== Pagination Computed =====
const totalPages = computed(() => {
  return Math.ceil(filteredVocabulary.value.length / ROWS_PER_PAGE)
})

const paginatedVocabulary = computed(() => {
  if (filteredVocabulary.value.length <= ROWS_PER_PAGE) {
    return filteredVocabulary.value
  }
  
  const start = (currentPage.value - 1) * ROWS_PER_PAGE
  const end = start + ROWS_PER_PAGE
  return filteredVocabulary.value.slice(start, end)
})

// Reset to page 1 when filters change
watch([searchQuery, selectedConjClass, selectedTransitivity, selectedAccent, selectedGojuuon], () => {
  currentPage.value = 1
})

const forms = [
  { id: 'DICT', label: '辞書形' },
  { id: 'NEGATIVE', label: '否定形' },
  { id: 'PASSIVE', label: '受身形' },
  { id: 'CAUSATIVE', label: '使役形' },
  { id: 'POLITE', label: 'ます形' },
  { id: 'TAI', label: '希望形' },
  { id: 'SOU', label: 'そう形' },
  { id: 'MEIREI', label: '命令形' },
  { id: 'POTENTIAL', label: '可能形' },
  { id: 'KATEI', label: '仮定形' },
  { id: 'IKOU', label: '意向形' },
  { id: 'TE', label: 'て形' },
  { id: 'PASS', label: 'た形' },
] as const

// ===== State =====
const conjugation = ref<Conjugation>('DICT')

// ===== Kanji rotation (still UI layer) =====
const kanjiTick = ref(0)
let kanjiTimer: number | undefined

// ===== Keyboard navigation =====
const isInputElement = (target: EventTarget | null): boolean => {
  return target instanceof HTMLInputElement ||
         target instanceof HTMLTextAreaElement ||
         target instanceof HTMLSelectElement
}

const navigateConjugation = (direction: 'up' | 'down') => {
  const currentIndex = forms.findIndex(form => form.id === conjugation.value)
  const nextIndex = direction === 'up'
    ? (currentIndex <= 0 ? forms.length - 1 : currentIndex - 1)
    : (currentIndex >= forms.length - 1 ? 0 : currentIndex + 1)
  
  conjugation.value = forms[nextIndex].id
  
  nextTick(() => {
    const activeButton = document.querySelector(
      `button[data-form-id="${forms[nextIndex].id}"]`
    ) as HTMLElement
    activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (isInputElement(event.target)) return
  
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    navigateConjugation('up')
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    navigateConjugation('down')
  } else if (event.key === 'ArrowLeft') {
    // Navigate to previous page if pagination is active
    if (filteredVocabulary.value.length > ROWS_PER_PAGE && currentPage.value > 1) {
      event.preventDefault()
      currentPage.value--
    }
  } else if (event.key === 'ArrowRight') {
    // Navigate to next page if pagination is active
    if (filteredVocabulary.value.length > ROWS_PER_PAGE && currentPage.value < totalPages.value) {
      event.preventDefault()
      currentPage.value++
    }
  }
}

onMounted(() => {
  kanjiTimer = window.setInterval(() => {
    kanjiTick.value++
  }, 5000)
  
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (kanjiTimer !== undefined) {
    window.clearInterval(kanjiTimer)
  }
  
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown)
})

const activeKanji = (v: Verb): string => {
  const conjugated = getConjugatedVerb(v)
  if (!conjugated.kanjiStart || conjugated.kanjiStart.length === 0) return ''
  const idx = kanjiTick.value % conjugated.kanjiStart.length
  return conjugated.kanjiStart[idx]
}

// ===== Get conjugated verb =====
const getConjugatedVerb = (v: Verb): Verb => {
  return conjugate(v, conjugation.value)
}

// ===== Get Ren'youkei (Continuative form) using iStem =====
const getRenyoukei = (v: Verb): string => {
  const kanji = v.kanjiStart && v.kanjiStart.length > 0 ? v.kanjiStart[0] : ''
  
  if (v.conjClass === 'GODAN') {
    // For Godan verbs: replace last character with iStem
    const stem = v.kanaEnd.slice(0, -1)
    const last = v.kanaEnd.slice(-1)
    const iStemChar = iStem[last] || last
    return kanji + stem + iStemChar
  } else if (v.conjClass === 'SHIMO_ICHIDAN' || v.conjClass === 'KAMI_ICHIDAN') {
    // For Ichidan verbs: remove 'る' from kanaEnd
    const stem = v.kanaEnd.slice(0, -1)
    return kanji + stem
  } else if (v.conjClass === 'SAHEN') {
    // For Sahen verbs: kanaStart becomes 'し'
    return kanji + 'し'
  } else if (v.conjClass === 'KAHEN') {
    // For Kahen verbs: '来' + 'き'
    return kanji + 'き'
  }
  
  // Fallback
  return kanji + v.kanaEnd
}

// ===== Copy Function with Success Feedback =====
const copiedStates = ref<Record<string, boolean>>({})

const copyToClipboard = async (text: string, verbKey: string, event?: Event) => {
  if (event) {
    event.stopPropagation() // Prevent event bubbling
  }
  
  // Prevent duplicate triggers
  if (copiedStates.value[verbKey]) {
    return
  }
  
  try {
    await navigator.clipboard.writeText(text)
    // Show success message
    copiedStates.value[verbKey] = true
    // Hide after 0.8 seconds
    setTimeout(() => {
      copiedStates.value[verbKey] = false
    }, 800)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// ===== Get text to copy: first kanji + kanaEnd =====
const getTextToCopy = (v: Verb): string => {
  const kanji = v.kanjiStart && v.kanjiStart.length > 0 ? v.kanjiStart[0] : ''
  return kanji + v.kanaEnd
}

// ===== Google Search Function =====
const searchOnGoogle = (v: Verb) => {
  const searchText = getTextToCopy(v)
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`
  window.open(googleUrl, '_blank')
}

const shouldHide = (v: Verb): boolean => {
  return v.transitivity === 'VI' && (
    conjugation.value === 'CAUSATIVE' || 
    conjugation.value === 'MEIREI' || 
    conjugation.value === 'TAI' || 
    conjugation.value === 'IKOU'
  )
}
</script>

<template>
  <!-- Left: Table  Right: Control Panel -->
  <div class="layout">
    <!-- Left: Verb Table -->
    <div class="layout-main">
      <!-- Filters -->
      <div class="filters-container">
        <!-- Search Input -->
        <SearchInput
          v-model="searchQuery"
          :show-results="true"
          :filtered-count="filteredVocabulary.length"
          :total-count="vocabulary.length"
        />
        
        <!-- Dropdown Filters -->
        <div class="filter-row">
          <div class="filter-wrapper">
            <label class="filter-label" :class="{ hidden: selectedConjClass }">活用形</label>
            <select v-model="selectedConjClass" class="filter-select" :class="{ 'empty-selected': !selectedConjClass }">
              <option value="">全て</option>
              <option v-for="cls in uniqueConjClasses" :key="cls" :value="cls">
                {{ CONJ_CLASS_JA[cls] || cls }}
              </option>
            </select>
          </div>
          
          <div class="filter-wrapper">
            <label class="filter-label" :class="{ hidden: selectedTransitivity }">自他動詞</label>
            <select v-model="selectedTransitivity" class="filter-select" :class="{ 'empty-selected': !selectedTransitivity }">
              <option value="">全て</option>
              <option v-for="trans in transitivityOptions" :key="trans" :value="trans">
                {{ TRANSITIVITY_JA[trans] || trans }}
              </option>
            </select>
          </div>
          
          <div class="filter-wrapper">
            <label class="filter-label" :class="{ hidden: selectedAccent }">アクセント</label>
            <select v-model="selectedAccent" class="filter-select" :class="{ 'empty-selected': !selectedAccent }">
              <option value="">全て</option>
              <option v-for="acc in uniqueAccents" :key="acc" :value="acc">
                {{ ACCENT_JA[acc] || acc }}
              </option>
            </select>
          </div>
        </div>
        
      </div>
      
      <table class="styled-table sortable">
        <thead>
        <tr>
          <th>動詞</th>
          <th>連用形</th>
          <th>アクセント</th>
          <th>自他動詞</th>
          <th></th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(v, idx) in paginatedVocabulary" :key="`${v.kanaStart}-${v.kanaEnd}`">
          <th>
            <div v-if="!shouldHide(v)" class="text-base">
              <ruby>
                <transition name="kanji-fancy" mode="out-in">
                  <span
                      :key="`${v.kanaStart}-${v.kanaEnd}-${activeKanji(v) || getConjugatedVerb(v).kanaStart}`"
                      class="kanji-char"
                  >
                    {{ activeKanji(v) || getConjugatedVerb(v).kanaStart }}
                  </span>
                </transition>
                <rt>{{ getConjugatedVerb(v).kanaStart }}</rt>
              </ruby>
              {{ getConjugatedVerb(v).kanaEnd }}
            </div>
          </th>

          <th>
            {{ getRenyoukei(v) }}
          </th>

          <th>
            <template v-if="v.accent.length > 1">
              <div class="accent-container">
                <!-- Static text layer (no transition) -->
                <span class="accent-text">
                  {{ v.kanaStart + v.kanaEnd }}
                </span>
                <!-- Accent line layers (with transition) -->
                <transition name="accent-fade" mode="out-in">
                  <span 
                    :key="`${v.kanaStart}-${v.kanaEnd}-${kanjiTick % v.accent.length}`" 
                    class="accent-lines"
                  >
                    <template v-for="(seg, sIdx) in accentSegments(v, v.accent[kanjiTick % v.accent.length])" :key="sIdx">
                      <span :class="seg.cls" class="accent-line-segment">
                        {{ seg.text }}
                      </span>
                    </template>
                  </span>
                </transition>
              </div>
            </template>
            <template v-else>
              <template v-for="(seg, sIdx) in accentSegments(v, v.accent[0])" :key="sIdx">
                <span :class="seg.cls">
                  {{ seg.text }}
                </span>
              </template>
            </template>
          </th>
          <th>
            {{ TRANSITIVITY_JA[v.transitivity] || v.transitivity }}
          </th>
          <th>
            <div class="action-buttons">
              <div class="copy-wrapper">
                <button 
                  type="button" 
                  class="copy-btn"
                  @click="copyToClipboard(getTextToCopy(v), `${v.kanjiStart[0]}-${v.kanaEnd}`, $event)"
                  title="Copy"
                >
                  <span class="copy-icon">📋</span>
                </button>
                <transition name="copy-fade">
                  <span 
                    v-if="copiedStates[`${v.kanjiStart[0]}-${v.kanaEnd}`]"
                    :key="`copy-${v.kanjiStart[0]}-${v.kanaEnd}`"
                    class="copy-success"
                  >
                    コピーしました
                  </span>
                </transition>
              </div>
              <button 
                type="button" 
                class="google-btn"
                @click="searchOnGoogle(v)"
                title="Google Search"
              >
                <span class="google-icon">🔍</span>
              </button>
            </div>
          </th>
        </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <Pagination
        v-if="filteredVocabulary.length > ROWS_PER_PAGE"
        v-model:currentPage="currentPage"
        :totalPages="totalPages"
        :visiblePagesAtStart="VISIBLE_PAGES_AT_START"
        :visiblePagesAtEnd="VISIBLE_PAGES_AT_END"
        :jumpPages="JUMP_PAGES"
      />
    </div>

    <!-- Right: Control panels -->
    <aside class="layout-sidebar">
      <div class="sidebar-sections-row">
        <!-- Gojuuon Filter Panel -->
        <div class="sidebar-section">
          <GojuuonPanel v-model="selectedGojuuon" :disabled-chars="gojuuonAvailability" />
        </div>
        
        <!-- Conjugation form control panel -->
        <div class="sidebar-section">
          <div class="toggle-column">
            <button
                v-for="form in forms"
                :key="form.id"
                type="button"
                class="toggle-btn"
                :class="{ active: conjugation === form.id }"
                :data-form-id="form.id"
                @click="conjugation = form.id"
            >
              {{ form.label }}
            </button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

