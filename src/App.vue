<script setup lang="ts">
import { ref } from 'vue'
import VerbTable from './components/VerbTable.vue'
import CSVTable from "./components/CSVTable.vue";

// ===== CSV Module Configuration =====
interface CSVModuleConfig {
  id: string
  displayName: string
}

// ===== CSV Module List =====
const csvModules: CSVModuleConfig[] = [
  { id: 'compound', displayName: '複合動詞' },
  { id: 'honorific', displayName: '敬語動詞' },
  { id: 'ki', displayName: '気の動詞' },
  { id: 'unit', displayName: '単位' },
]

// ===== Tab Configuration =====
const tabs = [
  { id: 'verbs', label: '動詞リスト' },
  ...csvModules.map(module => ({ id: module.id, label: module.displayName }))
]

// ===== State =====
const activeTab = ref<string>(tabs[0].id)
</script>

<template>
  <main class="page-container">
    <h1>日本語語彙</h1>

    <!-- Tabs -->
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

    <!-- Verbs tab content -->
    <div v-show="activeTab === 'verbs'" class="tabcontent">
      <VerbTable />
    </div>

    <!-- CSV module tab content -->
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