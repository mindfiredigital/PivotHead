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
import type { PivotDataRecord, PivotOptions, PaginationConfig, FileConnectionResult } from '@mindfiredigital/pivothead-vue'

// Component refs
const pivotRef = ref()

// Reactive state
const currentMode = ref<'default' | 'minimal'>('default')
const statusMessage = ref('Ready')
const currentViewMode = ref<'raw' | 'processed'>('processed')
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref<FileConnectionResult | null>(null)

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
</style>
