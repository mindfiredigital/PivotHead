<template>
  <div class="container">
    <h1>🚀 PivotHead Vue Example</h1>
    
    <!-- Mode switcher -->
    <div class="mode-switcher">
      <button 
        @click="currentMode = 'default'" 
        :class="{ active: currentMode === 'default' }"
        class="mode-button"
      >
        Default Mode
      </button>
      <button 
        @click="currentMode = 'minimal'" 
        :class="{ active: currentMode === 'minimal' }"
        class="mode-button"
      >
        Minimal Mode
      </button>
    </div>
    
    <!-- Default Mode -->
    <div v-if="currentMode === 'default'">
      <div class="description">
        <p><strong>Default Mode</strong> provides a complete, full-featured pivot table with all built-in controls and UI elements out of the box.</p>
        <p>This example demonstrates the Vue wrapper with sample sales data, including interactive filtering, sorting, and data manipulation.</p>
      </div>

      <PivotHead
        ref="pivotRef"
        mode="default"
        :data="salesData"
        :options="pivotOptions"
        @state-change="handleStateChange"
        @view-mode-change="handleViewModeChange"
        @pagination-change="handlePaginationChange"
        class="pivot-container"
      />
    </div>
    
    <!-- Minimal Mode -->
    <div v-else-if="currentMode === 'minimal'">
      <div class="description">
        <p><strong>Minimal Mode</strong> provides slot-based customization where you can build your own UI while leveraging the core pivot engine.</p>
        <p>This example demonstrates custom table rendering, sorting, filtering, pagination, and drill-down functionality.</p>
      </div>

      <MinimalMode
        :data="salesData"
        :options="pivotOptions"
        class="pivot-container"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { PivotHead } from '@mindfiredigital/pivothead-vue'
// @ts-ignore
import MinimalMode from './components/MinimalMode.vue'
import type { PivotDataRecord, PivotOptions, PaginationConfig } from '@mindfiredigital/pivothead-vue'

// Component refs
const pivotRef = ref()

// Reactive state
const currentMode = ref<'default' | 'minimal'>('default')
const statusMessage = ref('Ready')
const currentViewMode = ref<'raw' | 'processed'>('processed')

// Sample sales data
const salesData = ref<PivotDataRecord[]>([
  { country: 'Australia', category: 'Accessories', price: 174, discount: 23 },
  { country: 'Australia', category: 'Accessories', price: 680, discount: 80 },
  { country: 'Australia', category: 'Cars', price: 900, discount: 50 },
  { country: 'Australia', category: 'Electronics', price: 1200, discount: 120 },
  { country: 'Canada', category: 'Cars', price: 180, discount: 80 },
  { country: 'Canada', category: 'Electronics', price: 850, discount: 85 },
  { country: 'Canada', category: 'Accessories', price: 320, discount: 40 },
  { country: 'USA', category: 'Electronics', price: 1500, discount: 150 },
  { country: 'USA', category: 'Cars', price: 2200, discount: 220 },
  { country: 'USA', category: 'Accessories', price: 450, discount: 45 },
  { country: 'Germany', category: 'Cars', price: 1800, discount: 90 },
  { country: 'Germany', category: 'Electronics', price: 950, discount: 95 },
  { country: 'France', category: 'Accessories', price: 380, discount: 38 },
  { country: 'France', category: 'Cars', price: 1600, discount: 160 },
  { country: 'UK', category: 'Electronics', price: 1100, discount: 110 },
])

// Pivot configuration
const pivotOptions = ref<PivotOptions>({
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'price', caption: 'Sum of Price', aggregation: 'sum' },
    { uniqueName: 'discount', caption: 'Sum of Discount', aggregation: 'sum' },
  ],
  pageSize: 10,
})

// Active filters
const activeFilters = ref([])

// Pagination configuration
const paginationConfig = ref<PaginationConfig>({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1
})

// Event handlers
const handleStateChange = (state: any) => {
  console.log('Pivot state changed:', state)
  statusMessage.value = `State updated at ${new Date().toLocaleTimeString()}`
}

const handleViewModeChange = (data: { mode: 'raw' | 'processed' }) => {
  currentViewMode.value = data.mode
  statusMessage.value = `View mode changed to ${data.mode}`
}

const handlePaginationChange = (pagination: PaginationConfig) => {
  paginationConfig.value = { ...pagination }
  statusMessage.value = `Page changed to ${pagination.currentPage}`
}

// Methods
const refreshData = () => {
  if (pivotRef.value) {
    pivotRef.value.refresh()
    statusMessage.value = 'Data refreshed successfully'
  }
}

const addRandomData = () => {
  const countries = ['Australia', 'Canada', 'USA', 'Germany', 'France', 'UK', 'Italy', 'Spain']
  const categories = ['Accessories', 'Cars', 'Electronics', 'Clothing', 'Books']
  
  const newRecord: PivotDataRecord = {
    country: countries[Math.floor(Math.random() * countries.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Math.floor(Math.random() * 2000) + 100,
    discount: Math.floor(Math.random() * 200) + 10
  }
  
  salesData.value.push(newRecord)
  statusMessage.value = `Added new record: ${newRecord.category} in ${newRecord.country}`
}

const exportToExcel = () => {
  if (pivotRef.value) {
    pivotRef.value.exportToExcel('vue-example-sales-data')
    statusMessage.value = 'Exported to Excel successfully'
  }
}

const exportToPDF = () => {
  if (pivotRef.value) {
    pivotRef.value.exportToPDF('vue-example-sales-data')
    statusMessage.value = 'Exported to PDF successfully'
  }
}

const toggleViewMode = () => {
  if (pivotRef.value) {
    const newMode = currentViewMode.value === 'raw' ? 'processed' : 'raw'
    pivotRef.value.setViewMode(newMode)
  }
}

onMounted(() => {
  statusMessage.value = 'PivotHead Vue component loaded successfully'
})
</script>

<style scoped>
.pivot-container {
  margin: 20px 0;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.mode-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.mode-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-button:hover {
  background: #e9ecef;
}

.mode-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.description {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}
</style>
