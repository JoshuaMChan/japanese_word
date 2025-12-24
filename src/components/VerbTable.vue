<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import verbs from '../assets/verbs.json'
import { Verb } from '../types/verb'
import { accentSegments } from '../utils/accent'
import { conjugate, Conjugation } from '../utils/conjugation.ts'

const vocabulary = verbs as Verb[]

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
  // If user is typing in an input field, don't handle keyboard events
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
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
      <table class="styled-table sortable">
        <thead>
        <tr>
          <th>動詞</th>
          <th>アクセント</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(v, idx) in vocabulary" :key="idx">
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

