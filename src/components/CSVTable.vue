<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {parseCSV, CSVData} from '../utils/csvParser'

interface Props {
  id: string
  displayName: string
}

const props = defineProps<Props>()

const csvData = ref<CSVData>({headers: [], rows: []})
const loading = ref(true)
const error = ref<string | null>(null)

// 使用 Vite 的 glob 导入来预加载所有 CSV 文件
const csvModules = import.meta.glob('../assets/csvs/*.csv', {
  eager: false,
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

onMounted(async () => {
  try {
    // 构建文件路径（需要匹配 glob 模式）
    const filePath = `../assets/csvs/${props.id}.csv`

    // 从 glob 导入中获取对应的模块加载函数
    const moduleLoader = csvModules[filePath]

    if (!moduleLoader) {
      throw new Error(`未找到文件: ${props.id}.csv (路径: ${filePath})`)
    }

    // 加载模块
    const csvText = await moduleLoader()
    csvData.value = parseCSV(csvText)
    loading.value = false
  } catch (err) {
    error.value = `无法加载文件: ${props.id}.csv`
    loading.value = false
    console.error('CSV加载错误:', err)
    console.error('可用文件:', Object.keys(csvModules))
  }
})
</script>

<template>
  <div v-if="loading" class="csv-loading">加载中...</div>
  <div v-else-if="error" class="csv-error">{{ error }}</div>
  <div v-else class="layout">
    <div class="layout-main">
      <table class="styled-table sortable">
        <thead>
        <tr>
          <th v-for="(header, idx) in csvData.headers" :key="idx">
            {{ header }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, rowIdx) in csvData.rows" :key="rowIdx">
          <td v-for="(cell, cellIdx) in row" :key="cellIdx">
            <div class="text-base" v-html="cell.replace(/\//g, '<br>')">
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.csv-loading,
.csv-error {
  padding: 20px;
  text-align: center;
  color: #666;
}

.csv-error {
  color: #d32f2f;
}
</style>

