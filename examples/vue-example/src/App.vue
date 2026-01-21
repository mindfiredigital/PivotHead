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

    <!-- File Upload Controls -->
    <div class="upload-controls">
      <h2>ConnectService - File Upload</h2>
      <p class="upload-description">
        Test the ConnectService feature by uploading CSV or JSON files to populate the pivot table.
      </p>

      <div class="upload-buttons">
        <button
          @click="uploadCSVFile"
          :disabled="isUploading"
          class="upload-button csv-button"
        >
          Upload CSV File
        </button>
        <button
          @click="uploadJSONFile"
          :disabled="isUploading"
          class="upload-button json-button"
        >
          Upload JSON File
        </button>
        <button
          @click="uploadAnyFile"
          :disabled="isUploading"
          class="upload-button any-button"
        >
          Upload Any File (CSV/JSON)
        </button>
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ Math.round(uploadProgress) }}%</span>
      </div>

      <!-- Upload Result -->
      <div v-if="uploadResult && !isUploading" class="upload-result" :class="{ success: uploadResult.success, error: !uploadResult.success }">
        <h3>{{ uploadResult.success ? 'Upload Successful' : 'Upload Failed' }}</h3>
        <div v-if="uploadResult.success">
          <p><strong>File:</strong> {{ uploadResult.fileName }}</p>
          <p><strong>Records:</strong> {{ uploadResult.recordCount?.toLocaleString() }}</p>
          <p v-if="uploadResult.fileSize"><strong>File Size:</strong> {{ formatFileSize(uploadResult.fileSize) }}</p>
          <p v-if="uploadResult.performanceMode"><strong>Performance Mode:</strong> {{ uploadResult.performanceMode }}</p>
          <p v-if="uploadResult.columns"><strong>Columns:</strong> {{ uploadResult.columns.join(', ') }}</p>
          <div v-if="uploadResult.validationErrors && uploadResult.validationErrors.length > 0" class="validation-warnings">
            <h4>Warnings:</h4>
            <ul>
              <li v-for="(warning, index) in uploadResult.validationErrors" :key="index">{{ warning }}</li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p class="error-message">{{ uploadResult.error }}</p>
        </div>
      </div>

      <!-- Status Message -->
      <div class="status-message">
        <strong>Status:</strong> {{ statusMessage }}
      </div>
    </div>

    <!-- Data Visualization Section -->
    <div class="chart-controls">
      <h2>Data Visualization</h2>
      <p class="chart-description">
        Visualize your pivot table data with various chart types. Select a chart type and configure filters to customize your visualization.
      </p>

      <div class="chart-config">
        <!-- Chart Type Selector -->
        <div class="chart-type-section">
          <label for="chartType" class="chart-label">Chart Type:</label>
          <select
            id="chartType"
            :value="chartType"
            @change="handleChartTypeChange"
            class="chart-select"
          >
            <option value="none">-- Select Chart Type --</option>
            <optgroup v-for="group in chartTypeOptions" :key="group.group" :label="group.group">
              <option v-for="type in group.types" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Chart Filters (shown when chart type is selected) -->
        <div v-if="chartType !== 'none'" class="chart-filters">
          <!-- Measure Selection -->
          <div class="filter-group">
            <label class="filter-label">Measure:</label>
            <select v-model="selectedMeasure" class="filter-select">
              <option v-for="measure in chartFilterOptions.measures" :key="measure.uniqueName" :value="measure.uniqueName">
                {{ measure.caption }}
              </option>
            </select>
          </div>

          <!-- Row Selection -->
          <div class="filter-group">
            <label class="filter-label">
              Rows ({{ selectedRows.length }}/{{ chartFilterOptions.rows.length }}):
              <span class="select-actions">
                <button type="button" @click="selectAllRows" class="select-action-btn">All</button>
                <button type="button" @click="deselectAllRows" class="select-action-btn">None</button>
              </span>
            </label>
            <div class="checkbox-list">
              <label v-for="row in chartFilterOptions.rows" :key="row" class="checkbox-item">
                <input
                  type="checkbox"
                  :checked="selectedRows.includes(row)"
                  @change="toggleRowSelection(row)"
                />
                {{ row }}
              </label>
            </div>
          </div>

          <!-- Column Selection -->
          <div class="filter-group">
            <label class="filter-label">
              Columns ({{ selectedColumns.length }}/{{ chartFilterOptions.columns.length }}):
              <span class="select-actions">
                <button type="button" @click="selectAllColumns" class="select-action-btn">All</button>
                <button type="button" @click="deselectAllColumns" class="select-action-btn">None</button>
              </span>
            </label>
            <div class="checkbox-list">
              <label v-for="column in chartFilterOptions.columns" :key="column" class="checkbox-item">
                <input
                  type="checkbox"
                  :checked="selectedColumns.includes(column)"
                  @change="toggleColumnSelection(column)"
                />
                {{ column }}
              </label>
            </div>
          </div>

          <!-- Limit -->
          <div class="filter-group">
            <label class="filter-label">Limit (Top N):</label>
            <input
              type="number"
              v-model.number="chartLimit"
              min="1"
              max="100"
              class="limit-input"
            />
          </div>

          <!-- Action Buttons -->
          <div class="chart-actions">
            <button @click="applyChartFilters" class="chart-btn apply-btn">
              Apply &amp; Render Chart
            </button>
            <button @click="resetChartFilters" class="chart-btn reset-btn">
              Reset Filters
            </button>
            <button v-if="showChart" @click="hideChart" class="chart-btn hide-btn">
              Hide Chart
            </button>
          </div>
        </div>
      </div>
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
        @chart-rendered="handleChartRendered"
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { PivotHead } from '@mindfiredigital/pivothead-vue'
// @ts-ignore
import MinimalMode from './components/MinimalMode.vue'
import type { PivotDataRecord, PivotOptions, PaginationConfig, FileConnectionResult } from '@mindfiredigital/pivothead-vue'
import { ChartService } from '@mindfiredigital/pivothead-analytics'
import type { ChartType, ChartFilterConfig } from '@mindfiredigital/pivothead-analytics'

// Chart.js is loaded in main.ts to ensure it's available before the web component

// Component refs
const pivotRef = ref()

// Reactive state
const currentMode = ref<'default' | 'minimal'>('default')
const statusMessage = ref('Ready')
const currentViewMode = ref<'raw' | 'processed'>('processed')
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref<FileConnectionResult | null>(null)

// Chart state
const showChart = ref(false)
const chartType = ref<ChartType | 'none'>('none')
const chartServiceRef = ref<ChartService | null>(null)
const chartFilterOptions = ref<{
  measures: Array<{ uniqueName: string; caption: string }>;
  rows: string[];
  columns: string[];
}>({
  measures: [],
  rows: [],
  columns: []
})
const selectedMeasure = ref('')
const selectedRows = ref<string[]>([])
const selectedColumns = ref<string[]>([])
const chartLimit = ref(10)

// Chart types grouped by category
const chartTypeOptions = [
  { group: 'Basic Charts', types: [
    { value: 'column', label: 'Column Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' }
  ]},
  { group: 'Circular Charts', types: [
    { value: 'pie', label: 'Pie Chart' },
    { value: 'doughnut', label: 'Doughnut Chart' }
  ]},
  { group: 'Stacked Charts', types: [
    { value: 'stackedColumn', label: 'Stacked Column' },
    { value: 'stackedBar', label: 'Stacked Bar' },
    { value: 'stackedArea', label: 'Stacked Area' }
  ]},
  { group: 'Combo Charts', types: [
    { value: 'comboBarLine', label: 'Bar + Line' },
    { value: 'comboAreaLine', label: 'Area + Line' }
  ]},
  { group: 'Statistical Charts', types: [
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'histogram', label: 'Histogram' }
  ]},
  { group: 'Specialized Charts', types: [
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'funnel', label: 'Funnel Chart' },
    { value: 'sankey', label: 'Sankey Diagram' }
  ]}
]

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

// ConnectService methods
const uploadCSVFile = async () => {
  if (!pivotRef.value) {
    statusMessage.value = 'Pivot component not initialized'
    return
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0
    statusMessage.value = 'Opening file picker...'

    const result = await pivotRef.value.connectToLocalCSV({
      onProgress: (progress) => {
        uploadProgress.value = progress
        statusMessage.value = `Uploading CSV file: ${Math.round(progress)}%`
      }
    })

    uploadResult.value = result

    if (result.success) {
      statusMessage.value = `Successfully loaded ${result.recordCount} records from ${result.fileName}`
      console.log('Upload result:', result)
    } else {
      statusMessage.value = `Failed to upload: ${result.error}`
      console.error('Upload failed:', result)
    }
  } catch (error) {
    console.error('Error uploading CSV:', error)
    statusMessage.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const uploadJSONFile = async () => {
  if (!pivotRef.value) {
    statusMessage.value = 'Pivot component not initialized'
    return
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0
    statusMessage.value = 'Opening file picker...'

    const result = await pivotRef.value.connectToLocalJSON({
      onProgress: (progress) => {
        uploadProgress.value = progress
        statusMessage.value = `Uploading JSON file: ${Math.round(progress)}%`
      }
    })

    uploadResult.value = result

    if (result.success) {
      statusMessage.value = `Successfully loaded ${result.recordCount} records from ${result.fileName}`
      console.log('Upload result:', result)
    } else {
      statusMessage.value = `Failed to upload: ${result.error}`
      console.error('Upload failed:', result)
    }
  } catch (error) {
    console.error('Error uploading JSON:', error)
    statusMessage.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const uploadAnyFile = async () => {
  if (!pivotRef.value) {
    statusMessage.value = 'Pivot component not initialized'
    return
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0
    statusMessage.value = 'Opening file picker...'

    const result = await pivotRef.value.connectToLocalFile({
      onProgress: (progress) => {
        uploadProgress.value = progress
        statusMessage.value = `Uploading file: ${Math.round(progress)}%`
      }
    })

    uploadResult.value = result

    if (result.success) {
      statusMessage.value = `Successfully loaded ${result.recordCount} records from ${result.fileName}`
      console.log('Upload result:', result)
    } else {
      statusMessage.value = `Failed to upload: ${result.error}`
      console.error('Upload failed:', result)
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    statusMessage.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Chart methods
const initChartService = () => {
  if (!pivotRef.value) return

  try {
    // Access the underlying web component's engine
    const el = (pivotRef.value as any).$el || pivotRef.value
    const pivotElement = el.tagName === 'PIVOT-HEAD' ? el : el.querySelector('pivot-head')

    if (pivotElement && pivotElement.engine) {
      chartServiceRef.value = new ChartService(pivotElement.engine)
      console.log('ChartService initialized successfully')

      // Get available filter options
      const filterOptions = chartServiceRef.value.getAvailableFilterOptions()
      chartFilterOptions.value = filterOptions

      // Set defaults
      if (filterOptions.measures.length > 0) {
        selectedMeasure.value = filterOptions.measures[0].uniqueName
      }
      selectedRows.value = [...filterOptions.rows]
      selectedColumns.value = [...filterOptions.columns]

      statusMessage.value = 'Chart service initialized'
    } else {
      console.warn('Pivot engine not available yet')
      // Retry after a short delay
      setTimeout(initChartService, 500)
    }
  } catch (error) {
    console.error('Failed to initialize ChartService:', error)
    statusMessage.value = 'Failed to initialize chart service'
  }
}

const handleChartTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newType = target.value as ChartType | 'none'
  chartType.value = newType

  if (newType === 'none') {
    hideChart()
  } else {
    // Initialize chart service if not already done
    if (!chartServiceRef.value) {
      initChartService()
    }
    showChart.value = true
    // Render chart immediately when type is selected
    nextTick(() => {
      applyChartFilters()
    })
  }
}

const applyChartFilters = () => {
  console.log('applyChartFilters called', { chartType: chartType.value, pivotRef: pivotRef.value })

  if (!pivotRef.value || chartType.value === 'none') {
    console.warn('Cannot render chart: pivotRef or chartType not available')
    return
  }

  try {
    const filters: ChartFilterConfig = {
      selectedMeasure: selectedMeasure.value,
      selectedRows: selectedRows.value,
      selectedColumns: selectedColumns.value,
      limit: chartLimit.value
    }

    console.log('Chart filters:', filters)

    // Set filters on the chart service (local)
    if (chartServiceRef.value) {
      chartServiceRef.value.setFilters(filters)
    }

    // Set filters on the web component
    console.log('Setting chart filters on web component...')
    pivotRef.value.setChartFilters(filters)

    // Render the chart
    console.log('Rendering chart:', chartType.value)
    pivotRef.value.renderChart(chartType.value as ChartType)

    showChart.value = true
    statusMessage.value = `Chart rendered: ${chartType.value}`
    console.log('Chart render complete')
  } catch (error) {
    console.error('Failed to render chart:', error)
    statusMessage.value = `Failed to render chart: ${error}`
  }
}

const resetChartFilters = () => {
  // Reset to defaults
  if (chartFilterOptions.value.measures.length > 0) {
    selectedMeasure.value = chartFilterOptions.value.measures[0].uniqueName
  }
  selectedRows.value = [...chartFilterOptions.value.rows]
  selectedColumns.value = [...chartFilterOptions.value.columns]
  chartLimit.value = 10
  statusMessage.value = 'Chart filters reset'
}

const hideChart = () => {
  if (pivotRef.value) {
    pivotRef.value.hideChart()
  }
  showChart.value = false
  chartType.value = 'none'
  statusMessage.value = 'Chart hidden'
}

const handleChartRendered = (event: any) => {
  console.log('Chart rendered:', event)
  statusMessage.value = `Chart rendered successfully: ${event.type}`
}

const toggleRowSelection = (row: string) => {
  const index = selectedRows.value.indexOf(row)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(row)
  }
}

const toggleColumnSelection = (column: string) => {
  const index = selectedColumns.value.indexOf(column)
  if (index > -1) {
    selectedColumns.value.splice(index, 1)
  } else {
    selectedColumns.value.push(column)
  }
}

const selectAllRows = () => {
  selectedRows.value = [...chartFilterOptions.value.rows]
}

const deselectAllRows = () => {
  selectedRows.value = []
}

const selectAllColumns = () => {
  selectedColumns.value = [...chartFilterOptions.value.columns]
}

const deselectAllColumns = () => {
  selectedColumns.value = []
}

onMounted(() => {
  statusMessage.value = 'PivotHead Vue component loaded successfully'
  // Initialize chart service after component is mounted
  nextTick(() => {
    setTimeout(initChartService, 1000)
  })
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

/* Upload Controls */
.upload-controls {
  margin-bottom: 24px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.upload-controls h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #212529;
  font-size: 1.5rem;
}

.upload-description {
  margin-bottom: 16px;
  color: #6c757d;
  font-size: 0.95rem;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.upload-button {
  padding: 10px 20px;
  border: 2px solid;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.csv-button {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.csv-button:hover:not(:disabled) {
  background: #218838;
  border-color: #1e7e34;
}

.json-button {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.json-button:hover:not(:disabled) {
  background: #138496;
  border-color: #117a8b;
}

.any-button {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.any-button:hover:not(:disabled) {
  background: #5a6268;
  border-color: #545b62;
}

.upload-progress {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 24px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #007bff;
  min-width: 50px;
  text-align: right;
}

.upload-result {
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.upload-result.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.upload-result.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.upload-result h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.upload-result p {
  margin: 6px 0;
  font-size: 0.95rem;
}

.error-message {
  font-weight: 500;
}

.validation-warnings {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 4px;
}

.validation-warnings h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #856404;
  font-size: 1rem;
}

.validation-warnings ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.validation-warnings li {
  margin: 4px 0;
  font-size: 0.9rem;
}

.status-message {
  padding: 12px;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  color: #004085;
  font-size: 0.95rem;
}

/* Chart Controls */
.chart-controls {
  margin-bottom: 24px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-controls h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #212529;
  font-size: 1.5rem;
}

.chart-description {
  margin-bottom: 16px;
  color: #6c757d;
  font-size: 0.95rem;
}

.chart-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-type-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-label {
  font-weight: 600;
  color: #212529;
  min-width: 100px;
}

.chart-select {
  padding: 10px 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #fff;
  font-size: 0.95rem;
  min-width: 250px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chart-select:hover {
  border-color: #007bff;
}

.chart-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.chart-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-actions {
  display: flex;
  gap: 4px;
}

.select-action-btn {
  padding: 2px 8px;
  font-size: 0.75rem;
  border: 1px solid #ced4da;
  background: #fff;
  border-radius: 3px;
  cursor: pointer;
  color: #495057;
  transition: all 0.2s;
}

.select-action-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.checkbox-list {
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
}

.checkbox-item:hover {
  background: #f8f9fa;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.limit-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  font-size: 0.9rem;
  width: 100px;
}

.limit-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.chart-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.chart-btn {
  padding: 10px 20px;
  border: 2px solid;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.apply-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.apply-btn:hover {
  background: #218838;
  border-color: #1e7e34;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.reset-btn:hover {
  background: #5a6268;
  border-color: #545b62;
}

.hide-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.hide-btn:hover {
  background: #c82333;
  border-color: #bd2130;
}
</style>
