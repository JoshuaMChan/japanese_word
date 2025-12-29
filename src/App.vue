<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VerbTable from './components/VerbTable.vue'
import CSVTable from "./components/CSVTable.vue";

// ===== CSV Module Configuration =====
interface CSVModuleConfig {
  id: string
  displayName: string
  gojuuonFilterColumn?: number
}

// ===== CSV Module List =====
const csvModules: CSVModuleConfig[] = [
  { id: 'compound', displayName: '複合動詞', gojuuonFilterColumn: 1 },
  { id: 'honorific', displayName: '敬語の動詞' },
  { id: 'ki', displayName: '気の動詞' },
  { id: 'unit', displayName: '数え方' },
]

// ===== Tab Configuration =====
const tabs = [
  { id: 'verbs', label: '動詞リスト' },
  ...csvModules.map(module => ({ id: module.id, label: module.displayName }))
]

// ===== URL Routing =====
const getTabFromURL = (): string => {
  const hash = window.location.hash.slice(1)
  return tabs.some(tab => tab.id === hash) ? hash : tabs[0].id
}

const updateURL = (tabId: string) => {
  window.history.pushState(null, '', `#${tabId}`)
}

// ===== State =====
const activeTab = ref<string>(getTabFromURL())

// ===== URL Synchronization =====
watch(activeTab, updateURL)

onMounted(() => {
  window.addEventListener('popstate', () => {
    activeTab.value = getTabFromURL()
  })
  
  const hash = window.location.hash
  window.history.replaceState(null, '', hash || `#${activeTab.value}`)
})
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
          :showGojuuon="module.id === csvModules[0].id"
          :gojuuonFilterColumn="module.gojuuonFilterColumn"
        />
      </div>
    </template>
  </main>
</template>