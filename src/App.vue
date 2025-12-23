<script setup lang="ts">
import { ref } from 'vue'
import VerbTable from './components/VerbTable.vue'
import NumbersTab from './components/NumbersTab.vue'

// ===== 状态 =====
const activeTab = ref<'verbs' | 'numbers'>('verbs')
</script>

<template>
  <main class="page-container">
    <h1>日本語語彙</h1>

    <!-- 标签页 -->
    <div class="tab">
      <button 
        type="button"
        class="tab-button"
        :class="{ active: activeTab === 'verbs' }"
        @click="activeTab = 'verbs'"
      >
        動詞
      </button>
      <button 
        type="button"
        class="tab-button"
        :class="{ active: activeTab === 'numbers' }"
        @click="activeTab = 'numbers'"
      >
        数字
      </button>
    </div>

    <!-- 動詞标签页内容 -->
    <div v-show="activeTab === 'verbs'" class="tabcontent">
      <VerbTable />
    </div>

    <!-- 数字标签页内容 -->
    <div v-show="activeTab === 'numbers'" class="tabcontent">
      <NumbersTab />
    </div>
  </main>
</template>