<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import verbs from './assets/verbs.json'
import {TRANSITIVITY_JA} from './constants/transitivity.ts'
import {
  Verb,
  PrimaryFormId,
  VoiceId,
} from './types/verb'
import {
  conjugatedEnding,
} from './utils/conjugation'
import {
  accentSegments
} from './utils/accent'

interface PrimaryFormDef {
  id: PrimaryFormId
  label: string
}

interface VoiceDef {
  id: VoiceId
  label: string
}

const vocabulary = verbs as Verb[]
const transLabel = (t: string) => TRANSITIVITY_JA[t] ?? t

const PRIMARY_FORMS: PrimaryFormDef[] = [
  { id: 'DICT',   label: '辞書形' },
  { id: 'MASU',   label: 'ます形' },
  { id: 'TA',     label: 'た形' },
  { id: 'TE',     label: 'て形' },
  { id: 'KATEI',  label: '仮定形' },
  { id: 'MEIREI', label: '命令形' },
  { id: 'IKOU',   label: '意向形' },
  { id: 'KIBOU',  label: '希望形' },
  { id: 'PROG',   label: '進行形' },
  { id: 'PERF',   label: '完了形' },
]

const VOICE_FORMS: VoiceDef[] = [
  { id: 'PASSIVE',   label: '受身形' },
  { id: 'CAUSATIVE', label: '使役形' },
  { id: 'POTENTIAL', label: '可能形' },
  { id: 'RESPECT',   label: '尊敬形' },
]

// ===== 状态 =====
const primaryForm = ref<PrimaryFormId>('DICT')
const selectedVoice = ref<VoiceId | null>(null)
const negative = ref(false)

const toggleVoice = (id: VoiceId) => {
  selectedVoice.value = selectedVoice.value === id ? null : id
}
const toggleNegative = () => {
  negative.value = !negative.value
}

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
  if (!v.KANJI_START || v.KANJI_START.length === 0) return ''
  const idx = kanjiTick.value % v.KANJI_START.length
  return v.KANJI_START[idx]
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
                        :key="activeKanji(v) || v.KANA_START"
                        class="kanji-char"
                    >
                      {{ activeKanji(v) || v.KANA_START }}
                    </span>
                  </transition>
                  <rt>{{ v.KANA_START }}</rt>
                </ruby>
                {{ conjugatedEnding(v, primaryForm, selectedVoice, negative) }}
              </div>
            </th>

            <th class="accent-cell">
              <template v-for="(accent, aIdx) in v.ACCENT_TYPE" :key="aIdx">
                <span
                    v-for="(seg, sIdx) in accentSegments(v, accent)"
                    :key="`${accent}-${sIdx}`"
                    :class="seg.cls"
                >
                  {{ seg.text }}
                </span>
                <span v-if="aIdx < v.ACCENT_TYPE.length - 1">・</span>
              </template>
            </th>

            <th>{{ transLabel(v.TRANSITIVITY) }}</th>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 右侧：形态切换控制面板 -->
      <aside class="layout-sidebar">
        <!-- 主形態（单选） -->
        <div class="sidebar-section">
          <div class="sidebar-title">主形</div>
          <div class="toggle-column">
            <button
                v-for="form in PRIMARY_FORMS"
                :key="form.id"
                type="button"
                class="toggle-btn"
                :class="{ active: primaryForm === form.id }"
                @click="primaryForm = form.id"
            >
              {{ form.label }}
            </button>
          </div>
        </div>

        <!-- 否定 -->
        <div class="sidebar-section">
          <div class="sidebar-title">否定</div>
          <button
              type="button"
              class="toggle-btn"
              :class="{ active: negative }"
              @click="toggleNegative"
          >
            否定形
          </button>
        </div>

        <!-- 语態 -->
        <div class="sidebar-section">
          <div class="sidebar-title">態</div>
          <div class="toggle-column">
            <button
                v-for="voice in VOICE_FORMS"
                :key="voice.id"
                type="button"
                class="toggle-btn"
                :class="{ active: selectedVoice === voice.id }"
                @click="toggleVoice(voice.id)"
            >
              {{ voice.label }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>