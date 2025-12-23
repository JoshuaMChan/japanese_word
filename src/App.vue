<script setup lang="ts">
import { ref } from 'vue'
import VerbTable from './components/VerbTable.vue'
import CSVTable from "./components/CSVTable.vue";

// ===== CSV 模块配置 =====
interface CSVModuleConfig {
  id: string
  displayName: string
}

// ===== CSV 模块列表 =====
const csvModules: CSVModuleConfig[] = [
  { id: 'compound', displayName: '複合動詞' },
  { id: 'honorific', displayName: '敬語' },
  { id: 'ki', displayName: '気の動詞' },
]

// ===== 标签页配置 =====
const tabs = [
  { id: 'verbs', label: '動詞' },
  ...csvModules.map(module => ({ id: module.id, label: module.displayName }))
]

// ===== 状态 =====
const activeTab = ref<string>(tabs[0].id)
</script>

<template>
  <main class="page-container">
    <h1>日本語語彙</h1>

    <!-- 标签页 -->
    <div class="tab">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 動詞标签页内容 -->
    <div v-show="activeTab === 'verbs'" class="tabcontent">
      <VerbTable />
    </div>

    <!-- CSV 模块标签页内容 -->
    <template v-for="module in csvModules" :key="module.id">
      <div 
        v-show="activeTab === module.id"
        class="tabcontent"
        :data-module-id="module.id"
        :data-active-tab="activeTab"
      >
        <CSVTable
          :id="module.id"
          :displayName="module.displayName"
        />
      </div>
    </template>
  </main>
</template>