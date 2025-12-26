<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import verbs from '../assets/verbs.json'
import { Verb } from '../types/verb'
import { accentSegments } from '../utils/accent'
import { conjugate, Conjugation } from '../utils/conjugation.ts'
import { TRANSITIVITY_JA } from '../constants/transitivity'

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

// ===== Get unique filter values =====
const uniqueConjClasses = computed(() => {
  const classes = new Set<string>()
  vocabulary.forEach(v => classes.add(v.conjClass))
  
  // Sort by defined order, then add any unknown classes at the end
  const ordered: string[] = []
  const unordered: string[] = []
  
  CONJ_CLASS_ORDER.forEach(cls => {
    if (classes.has(cls)) {
      ordered.push(cls)
    }
  })
  
  classes.forEach(cls => {
    if (!CONJ_CLASS_ORDER.includes(cls)) {
      unordered.push(cls)
    }
  })
  
  return [...ordered, ...unordered.sort()]
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
  vocabulary.forEach(v => {
    v.accent.forEach(acc => accents.add(acc))
  })
  
  // Sort by defined order, then add any unknown accents at the end
  const ordered: string[] = []
  const unordered: string[] = []
  
  ACCENT_ORDER.forEach(acc => {
    if (accents.has(acc)) {
      ordered.push(acc)
    }
  })
  
  accents.forEach(acc => {
    if (!ACCENT_ORDER.includes(acc)) {
      unordered.push(acc)
    }
  })
  
  return [...ordered, ...unordered.sort()]
})

// ===== Filter State =====
const searchQuery = ref('')
const selectedConjClass = ref<string>('')
const selectedTransitivity = ref<string>('')
const selectedAccent = ref<string>('')

// ===== Filter vocabulary based on all filters =====
const filteredVocabulary = computed(() => {
  let result = vocabulary
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(v => {
      // Search in original kana
      const originalKana = (v.kanaStart + v.kanaEnd).toLowerCase()
      if (originalKana.includes(query)) return true
      
      // Search in kanji
      if (v.kanjiStart && v.kanjiStart.some(kanji => kanji.includes(query))) {
        return true
      }
      
      // Search in conjugated form
      const conjugated = conjugate(v, conjugation.value)
      const conjugatedKana = (conjugated.kanaStart + conjugated.kanaEnd).toLowerCase()
      if (conjugatedKana.includes(query)) return true
      
      if (conjugated.kanjiStart && conjugated.kanjiStart.some(kanji => kanji.includes(query))) {
        return true
      }
      
      return false
    })
  }
  
  // Conjugation class filter
  if (selectedConjClass.value) {
    result = result.filter(v => v.conjClass === selectedConjClass.value)
  }
  
  // Transitivity filter (VIT is always shown regardless of selection)
  if (selectedTransitivity.value) {
    result = result.filter(v => {
      // VIT verbs are always included
      if (v.transitivity === 'VIT') {
        return true
      }
      // Otherwise, match the selected transitivity
      return v.transitivity === selectedTransitivity.value
    })
  }
  
  // Accent filter
  if (selectedAccent.value) {
    result = result.filter(v => v.accent.includes(selectedAccent.value))
  }
  
  return result
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

// ===== Keyboard navigation for conjugation forms =====
const handleKeyDown = (event: KeyboardEvent) => {
  // If user is typing in an input field or selecting from dropdown, don't handle keyboard events
  if (event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement || 
      event.target instanceof HTMLSelectElement) {
    return
  }

  const currentIndex = forms.findIndex(form => form.id === conjugation.value)
  
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    
    let nextIndex: number
    if (event.key === 'ArrowUp') {
      // Up key: move forward (decrement index, wrap to end if at start)
      nextIndex = currentIndex <= 0 ? forms.length - 1 : currentIndex - 1
    } else {
      // Down key: move backward (increment index, wrap to start if at end)
      nextIndex = currentIndex >= forms.length - 1 ? 0 : currentIndex + 1
    }
    
    conjugation.value = forms[nextIndex].id
    
    // Scroll to currently selected button
    nextTick(() => {
      const activeButton = document.querySelector(`button[data-form-id="${forms[nextIndex].id}"]`) as HTMLElement
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
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
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="検索..."
          />
        </div>
        
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
        
        <!-- Results count -->
        <div class="search-results-container">
          <span v-if="searchQuery || selectedConjClass || selectedTransitivity || selectedAccent" class="search-results">
            {{ filteredVocabulary.length }} / {{ vocabulary.length }}
          </span>
        </div>
      </div>
      
      <table class="styled-table sortable">
        <thead>
        <tr>
          <th>動詞</th>
          <th>アクセント</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(v, idx) in filteredVocabulary" :key="idx">
          <th>
            <div v-if="!shouldHide(v)" class="text-base">
              <ruby>
                <transition name="kanji-fancy" mode="out-in">
                  <span
                      :key="`${idx}-${activeKanji(v) || getConjugatedVerb(v).kanaStart}`"
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
            <template v-if="v.accent.length > 1">
              <transition name="accent-fade" mode="out-in">
                <span :key="`${idx}-${kanjiTick % v.accent.length}`" class="accent-wrapper">
                  <template v-for="(seg, sIdx) in accentSegments(v, v.accent[kanjiTick % v.accent.length])" :key="sIdx">
                    <span :class="seg.cls">
                      {{ seg.text }}
                    </span>
                  </template>
                </span>
              </transition>
            </template>
            <template v-else>
              <template v-for="(seg, sIdx) in accentSegments(v, v.accent[0])" :key="sIdx">
                <span :class="seg.cls">
                  {{ seg.text }}
                </span>
              </template>
            </template>
          </th>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Right: Conjugation form control panel -->
    <aside class="layout-sidebar">
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
    </aside>
  </div>
</template>

