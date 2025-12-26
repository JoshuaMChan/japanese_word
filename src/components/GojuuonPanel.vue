<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ===== Gojuuon Data =====
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

const selectedGojuuon = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const toggleGojuuon = (char: string) => {
  selectedGojuuon.value = selectedGojuuon.value === char ? '' : char
}
</script>

<template>
  <div class="gojuuon-panel">
    <div
        v-for="(row, rowIdx) in GOJUUON_ROWS"
        :key="rowIdx"
        class="gojuuon-row"
        :class="{ 'gojuuon-row-3-chars': row.length === 3 }"
    >
      <button
          v-for="char in row"
          :key="char"
          type="button"
          class="gojuuon-btn"
          :class="{ active: selectedGojuuon === char }"
          @click="toggleGojuuon(char)"
      >
        {{ char }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Gojuuon Filter Panel */
.gojuuon-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gojuuon-row {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

/* Align 3-character rows to 1st, 3rd, 5th columns */
.gojuuon-row-3-chars {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
}

.gojuuon-row-3-chars .gojuuon-btn:nth-child(1) {
  grid-column: 1;
}

.gojuuon-row-3-chars .gojuuon-btn:nth-child(2) {
  grid-column: 3;
}

.gojuuon-row-3-chars .gojuuon-btn:nth-child(3) {
  grid-column: 5;
}

.gojuuon-btn {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  min-width: 32px;
  text-align: center;
  transition: all 0.2s;
  line-height: 1.2;
}

.gojuuon-btn:hover {
  border-color: #009879;
  background-color: #f0f9f7;
}

.gojuuon-btn.active {
  border-color: #009879;
  background-color: #009879;
  color: #fff;
}
</style>

