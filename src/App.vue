<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import verbs from './assets/verbs.json'
import {TRANSITIVITY_JA} from './constants/transitivity.ts'
import {
  Verb
} from './types/verb'
import {
  accentSegments
} from './utils/accent'
import {conjugateEnding, Conjugation} from "./utils/conjugation.ts";

interface Form {
  id: Conjugation
  label: string
}

const vocabulary = verbs as Verb[]
const transLabel = (t: string) => TRANSITIVITY_JA[t] ?? t

const forms = [
  { id: 'DICT',   label: '辞書形' },
  { id: 'YOU',   label: 'よう形' },
  { id: 'NEGATIVE',   label: '否定形' },
  { id: 'PASSIVE',   label: '受身形' },
  { id: 'CAUSATIVE', label: '使役形' },
  { id: 'CAUSATIVE_PASSIVE', label: '使役受身形' },
  { id: 'POLITE',   label: 'ます形' },
  { id: 'TAI', label: '希望形' },
  { id: 'SOU', label: 'そう形' },
  { id: 'MEIREI', label: '命令形' },
  { id: 'POTENTIAL',   label: '可能形' },
  { id: 'KATEI',  label: '仮定形' },
  { id: 'IKOU',   label: '意向形' },
  { id: 'TE',     label: 'て形' },
  { id: 'PASS',     label: 'た形' },
] as const

// ===== 状态 =====
const conjugation = ref<Conjugation>('DICT')

// ===== 汉字轮播（仍然属于 UI 层） =====
const kanjiTick = ref(0)
let kanjiTimer: number | undefined

onMounted(() => {
  kanjiTimer = window.setInterval(() => {
    kanjiTick.value++
  }, 5000)
})

onUnmounted(() => {
  if (kanjiTimer !== undefined) {
    window.clearInterval(kanjiTimer)
  }
})

const activeKanji = (v: Verb): string => {
  if (!v.kanjiStart || v.kanjiStart.length === 0) return ''
  const idx = kanjiTick.value % v.kanjiStart.length
  return v.kanjiStart[idx]
}
</script>

<template>
  <main class="page-container">
    <h1>日本語動詞</h1>

    <!-- 左：表格  右：控制面板 -->
    <div class="layout">
      <!-- 左侧：動詞表 -->
      <div class="layout-main">
        <table class="styled-table sortable">
          <thead>
          <tr>
            <th>動詞</th>
            <th>アクセント</th>
            <th>自他動詞</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="(v, idx) in vocabulary" :key="idx">
            <th class="verb-cell">
              <div class="verb-base">
                <ruby>
                  <transition name="kanji-fancy" mode="out-in">
                    <span
                        :key="activeKanji(v) || v.kanaStart"
                        class="kanji-char"
                    >
                      {{ activeKanji(v) || v.kanaStart }}
                    </span>
                  </transition>
                  <rt>{{ v.kanaStart }}</rt>
                </ruby>
                {{ conjugateEnding(v, conjugation) }}
              </div>
            </th>

            <th class="accent-cell">
              <template v-for="(accent, aIdx) in v.accent" :key="aIdx">
                <span
                    v-for="(seg, sIdx) in accentSegments(v, accent)"
                    :key="`${accent}-${sIdx}`"
                    :class="seg.cls"
                >
                  {{ seg.text }}
                </span>
                <span v-if="aIdx < v.accent.length - 1">・</span>
              </template>
            </th>

            <th>{{ transLabel(v.transitivity) }}</th>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 右侧：形态切换控制面板 -->
      <aside class="layout-sidebar">
        <div class="sidebar-section">
          <div class="toggle-column">
            <button
                v-for="form in forms"
                :key="form.id"
                type="button"
                class="toggle-btn"
                :class="{ active: conjugation === form.id }"
                @click="conjugation = form.id"
            >
              {{ form.label }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>