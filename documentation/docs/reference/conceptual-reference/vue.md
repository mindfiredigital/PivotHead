---
id: vue-conceptual-reference
title: Vue Concepts
sidebar_label: Vue
---

For Vue developers, the `@pivothead/vue` package offers a reactive and intuitive way to build a **headless pivot table**.

# Vue Wrapper

A powerful Vue 3 wrapper for PivotHead that provides seamless integration with reactive data binding, TypeScript support, and Vue-specific optimizations. The wrapper bridges Vue applications with the PivotHead web component while maintaining full Vue ecosystem compatibility.

## Overview

The PivotHead Vue wrapper (`@mindfiredigital/pivothead-vue`) offers:

- **Vue 3 Reactivity**: Full integration with Vue's reactive system and deep watching
- **WebAssembly Acceleration**: 30-40% faster CSV parsing with WASM-powered engine
- **Streaming + WASM Hybrid**: Handle 800MB+ files with intelligent chunking
- **ConnectService**: Zero-config file uploads with automatic format detection
- **TypeScript Support**: Complete type definitions for all APIs and props
- **Event Bridge**: Converts web component events to Vue events seamlessly
- **Slot System**: Custom slot support for minimal mode customization
- **Template Refs**: Direct access to all underlying web component methods
- **Three Display Modes**: Default, minimal, and none (headless) modes
- **Performance Optimizations**: Vue-specific optimizations for large datasets

## Architecture

````

### Bridge Implementation

The Vue wrapper acts as an intelligent bridge that handles:

- **Prop Reactivity**: Deep watching of props with proper change detection
- **Event Translation**: Converting web component CustomEvents to Vue events
- **Reference Management**: Template refs for method access and lifecycle management
- **Data Serialization**: Converting reactive Vue data to plain objects for the web component
- **State Synchronization**: Keeping Vue state in sync with the pivot engine

## Installation

### Basic Installation

```bash
npm install @mindfiredigital/pivothead-vue
````

### With Dependencies

```bash
npm install @mindfiredigital/pivothead-vue vue@^3.0.0
```

### Browser Support Setup

For older browsers, you may need polyfills:

```bash
npm install @webcomponents/webcomponentsjs
```

## Basic Usage

### Simple Integration

```vue
<template>
  <PivotHead
    :data="pivotData"
    :options="pivotOptions"
    @state-change="handleStateChange"
    @view-mode-change="handleViewModeChange"
    @pagination-change="handlePaginationChange"
  />
</template>

<script setup>
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotData = [
  { name: 'John', age: 30, city: 'New York', sales: 1200 },
  { name: 'Jane', age: 25, city: 'Los Angeles', sales: 800 },
  { name: 'Bob', age: 35, city: 'New York', sales: 950 },
  { name: 'Alice', age: 28, city: 'Los Angeles', sales: 1100 },
];

const pivotOptions = {
  rows: [{ uniqueName: 'city', caption: 'City' }],
  columns: [{ uniqueName: 'age', caption: 'Age' }],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
  ],
};

const handleStateChange = state => {
  console.log('Pivot state changed:', state);
};

const handleViewModeChange = data => {
  console.log('View mode changed to:', data.mode);
};

const handlePaginationChange = pagination => {
  console.log('Pagination changed:', pagination);
};
</script>
```

## WebAssembly Performance

PivotHead Vue leverages cutting-edge WebAssembly technology to deliver industry-leading performance for large-scale data processing. The WASM-powered CSV parser provides **30-40% faster parsing** compared to pure JavaScript implementations.

### Performance Benchmarks

Real-world performance on Apple M1, 16GB RAM, Chrome 120:

| Dataset Size | Mode                 | Processing Time | Memory Usage |
| ------------ | -------------------- | --------------- | ------------ |
| 100K rows    | Web Workers          | ~2.5s           | ~50MB        |
| 1M rows      | Web Workers          | ~8.5s           | ~200MB       |
| 10M rows     | **Streaming + WASM** | **~25-30s**     | **~400MB**   |
| 800MB CSV    | **Streaming + WASM** | **~43s**        | **~800MB**   |

### Automatic Performance Mode Selection

PivotHead automatically selects the optimal processing mode based on your file size:

| File Size | Rows   | Mode                 | Speed            | Memory    |
| --------- | ------ | -------------------- | ---------------- | --------- |
| < 5MB     | < 10K  | **Standard**         | Fast             | Low       |
| 5-50MB    | 10K-1M | **Web Workers**      | Very Fast        | Medium    |
| 50-100MB  | 1M-5M  | **WASM**             | **Ultra Fast**   | Medium    |
| > 100MB   | > 5M   | **Streaming + WASM** | **Blazing Fast** | Optimized |

### How WASM Works

The WebAssembly module (`csvParser.wasm`) is a compiled AssemblyScript program that runs at near-native speed in the browser. It provides:

- **Binary Format Parsing**: Direct binary processing without JavaScript overhead
- **Memory Efficiency**: Low-level memory management for optimal RAM usage
- **Parallel Processing**: Multi-threaded parsing with Web Workers
- **Streaming Architecture**: Process files in chunks to handle massive datasets

### WASM Configuration

The WASM module is automatically loaded from your public assets:

```typescript
// WASM is loaded automatically, but you can verify it's working
const result = await pivotRef.value.connectToLocalCSV({
  onProgress: progress => {
    console.log(`Progress: ${progress}%`);
  },
});

console.log(`Performance Mode: ${result.performanceMode}`);
// Output: 'streaming-wasm', 'wasm', 'workers', or 'standard'
```

### Browser Support

| Browser | Version | WASM Support | Fallback    |
| ------- | ------- | ------------ | ----------- |
| Chrome  | 57+     | Yes          | -           |
| Firefox | 52+     | Yes          | -           |
| Safari  | 11+     | Yes          | -           |
| Edge    | 16+     | Yes          | -           |
| IE 11   | -       | No           | Web Workers |

**Note**: WASM gracefully falls back to Web Workers on unsupported browsers, ensuring compatibility across all modern platforms.

## ConnectService - Smart File Loading

ConnectService provides zero-configuration file uploading with intelligent format detection, automatic mode selection, and built-in progress tracking.

### Features

- **Automatic Mode Selection**: Intelligently chooses the best processing mode based on file size
- **Smart Auto-Layout**: Detects field types and creates optimal pivot configuration
- **Multiple Formats**: CSV and JSON support with custom parsing options
- **Progress Tracking**: Real-time upload and processing progress callbacks
- **Type Detection**: Automatic identification of strings, numbers, dates, and booleans
- **Custom Configuration**: Fine-grained control over delimiters, headers, and validation

### Basic CSV Upload

```vue
<template>
  <div>
    <button @click="uploadCSV" :disabled="isUploading">Upload CSV File</button>

    <div v-if="uploadProgress > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      <span>{{ Math.round(uploadProgress) }}%</span>
    </div>

    <div v-if="uploadResult" class="result-info">
      <p>Loaded {{ uploadResult.recordCount?.toLocaleString() }} records</p>
      <p>
        File: {{ uploadResult.fileName }} ({{
          formatFileSize(uploadResult.fileSize)
        }})
      </p>
      <p>⚡ Mode: {{ uploadResult.performanceMode }}</p>
    </div>

    <PivotHead
      ref="pivotRef"
      :data="[]"
      :options="{}"
      @state-change="handleStateChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadResult = ref(null);

const uploadCSV = async () => {
  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const result = await pivotRef.value.connectToLocalCSV({
      onProgress: progress => {
        uploadProgress.value = progress;
      },
    });

    if (result.success) {
      uploadResult.value = result;
      console.log('Upload successful!');
    } else {
      console.error('Upload failed:', result.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const handleStateChange = state => {
  console.log('Pivot state updated:', state);
};
</script>

<style scoped>
.progress-bar {
  width: 100%;
  height: 30px;
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
  margin: 16px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #45a049);
  transition: width 0.3s ease;
}

.progress-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-weight: bold;
}

.result-info {
  margin-top: 16px;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 4px;
  border-left: 4px solid #4caf50;
}
</style>
```

### Advanced CSV Upload with Custom Options

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();

const uploadAdvancedCSV = async () => {
  const result = await pivotRef.value.connectToLocalCSV({
    csv: {
      delimiter: ',', // Custom delimiter (default: ',')
      hasHeader: true, // First row contains headers (default: true)
      skipEmptyLines: true, // Skip empty lines (default: true)
      trimValues: true, // Trim whitespace (default: true)
    },
    maxRecords: 50000, // Limit number of records loaded
    maxFileSize: 100 * 1024 * 1024, // 100MB max file size
    useWorkers: true, // Force Web Workers mode
    workerCount: 4, // Number of parallel workers
    chunkSizeBytes: 5 * 1024 * 1024, // 5MB chunks for streaming
    onProgress: progress => {
      console.log(`Processing: ${progress.toFixed(1)}%`);
    },
  });

  if (result.success) {
    console.log(`Mode: ${result.performanceMode}`);
    console.log(`Columns: ${result.columns?.join(', ')}`);
    console.log(`Parse time: ${result.parseTime}ms`);
  }
};
</script>
```

### JSON File Upload

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();

const uploadJSON = async () => {
  const result = await pivotRef.value.connectToLocalJSON({
    json: {
      arrayPath: 'data.records', // Supports nested paths like 'response.data.items'
      validateSchema: true, // Validate JSON structure
    },
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
    onProgress: progress => {
      console.log(`Loading JSON: ${progress}%`);
    },
  });

  if (result.success) {
    console.log(`Loaded ${result.recordCount} records from JSON`);
  } else if (result.validationErrors) {
    console.error('Validation errors:', result.validationErrors);
  }
};
</script>
```

### Auto-Detect File Format

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();

// Automatically detects CSV or JSON based on file extension
const uploadAnyFile = async () => {
  const result = await pivotRef.value.connectToLocalFile({
    onProgress: progress => {
      console.log(`Upload progress: ${progress}%`);
    },
  });

  if (result.success) {
    console.log('File uploaded and processed!');
    console.log(`Format detected: ${result.fileName?.split('.').pop()}`);
  }
};
</script>
```

### How Auto-Layout Works

When you upload a file via ConnectService, PivotHead automatically analyzes your data and creates an optimal pivot configuration:

1. **Field Type Detection**:
   - Strings: Text fields with high cardinality
   - Numbers: Numeric values (integers, floats, currency)
   - Dates: ISO dates, timestamps, formatted dates
   - Booleans: true/false, yes/no, 1/0

2. **Dimension vs Measure Classification**:
   - **Low cardinality** (< 20 unique values) → Dimensions (rows/columns)
   - **High cardinality numeric** → Measures (aggregations)
   - **Date fields** → Dimensions for time-based analysis

3. **Intelligent Defaults**:
   - First string field → Row dimension
   - Second string field → Column dimension
   - All numeric fields → Measures with SUM aggregation
   - Date fields → Additional row dimensions

### ConnectService API Reference

```typescript
interface ConnectionOptions {
  csv?: {
    delimiter?: string; // Default: ','
    hasHeader?: boolean; // Default: true
    skipEmptyLines?: boolean; // Default: true
    trimValues?: boolean; // Default: true
    encoding?: string; // Default: 'utf-8'
  };
  json?: {
    arrayPath?: string; // Nested path to array (e.g., 'data.items')
    validateSchema?: boolean; // Default: false
  };
  maxFileSize?: number; // Maximum file size in bytes
  maxRecords?: number; // Limit number of records to load
  onProgress?: (progress: number) => void; // Progress callback (0-100)
  useWorkers?: boolean; // Force Web Workers mode
  workerCount?: number; // Number of parallel workers (default: 4)
  chunkSizeBytes?: number; // Chunk size for streaming (default: 5MB)
}

interface FileConnectionResult {
  success: boolean;
  data?: unknown[]; // Parsed data records
  fileName?: string; // Original file name
  fileSize?: number; // File size in bytes
  recordCount?: number; // Number of records loaded
  columns?: string[]; // Column names
  error?: string; // Error message if failed
  validationErrors?: string[]; // JSON validation errors
  performanceMode?: 'standard' | 'workers' | 'wasm' | 'streaming-wasm';
  parseTime?: number; // Parse time in milliseconds
  requiresPagination?: boolean; // True if dataset is large
}
```

## Display Modes

### Default Mode - Complete Solution

The default mode provides a full-featured pivot table with all built-in controls and UI elements.

<details>
<summary>Click to view the complete Default Mode example</summary>

```vue
<template>
  <PivotHead
    mode="default"
    :data="data"
    :options="options"
    @state-change="onStateChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const data = ref([
  { country: 'USA', category: 'Electronics', sales: 1500 },
  { country: 'UK', category: 'Clothing', sales: 800 },
  // ... more data
]);

const options = ref({
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [{ uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' }],
});

const onStateChange = state => {
  console.log('Current state:', state);
};
</script>
```

</details>

**Features:**

- Built-in filtering and sorting controls
- Automatic pagination with configurable page sizes
- Export functionality (Excel, PDF, HTML)
- Drag-and-drop field management
- Format customization popup
- View mode switching (raw/processed)

### Minimal Mode - Custom UI with Slots

Minimal mode provides slot-based customization for building custom interfaces while leveraging the core pivot engine.

<details>
<summary>Click to view the complete Minimal Mode example</summary>

```vue
<template>
  <PivotHead
    mode="minimal"
    :data="data"
    :options="options"
    :filters="activeFilters"
    @state-change="handleStateChange"
    @view-mode-change="handleViewModeChange"
    @pagination-change="handlePaginationChange"
  >
    <!-- Custom header with controls -->
    <template #header>
      <div class="custom-toolbar">
        <div class="filter-controls">
          <select v-model="selectedField">
            <option value="country">Country</option>
            <option value="category">Category</option>
          </select>
          <input
            v-model="filterValue"
            placeholder="Filter value"
            @keyup.enter="applyFilter"
          />
          <button @click="applyFilter">Apply Filter</button>
          <button @click="clearFilters">Clear All</button>
        </div>

        <div class="view-controls">
          <button @click="toggleViewMode">
            {{
              currentViewMode === 'processed'
                ? 'Show Raw Data'
                : 'Show Processed'
            }}
          </button>
          <button @click="exportData">Export Excel</button>
        </div>

        <div class="pagination-controls">
          <select v-model="pageSize" @change="updatePageSize">
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
    </template>

    <!-- Custom body with table implementation -->
    <template #body>
      <div class="custom-table-container">
        <table v-if="pivotState" class="pivot-table">
          <thead>
            <tr>
              <th
                v-for="(header, index) in tableHeaders"
                :key="index"
                @click="sortByColumn(header.field)"
                :class="{ sortable: header.sortable, sorted: header.sorted }"
              >
                {{ header.caption }}
                <span v-if="header.sorted" class="sort-indicator">
                  {{ header.sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in displayData"
              :key="rowIndex"
              @click="openDrillDown(row)"
              class="data-row"
            >
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                {{ formatCell(cell) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Custom pagination -->
        <div class="pagination">
          <button @click="previousPage" :disabled="currentPage <= 1">
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages">
            Next
          </button>
        </div>
      </div>
    </template>
  </PivotHead>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

// Component state
const selectedField = ref('country');
const filterValue = ref('');
const activeFilters = ref([]);
const pivotState = ref(null);
const currentViewMode = ref('processed');
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);

// Computed properties
const displayData = computed(() => {
  if (!pivotState.value) return [];
  return currentViewMode.value === 'processed'
    ? pivotState.value.processedData
    : pivotState.value.rawData;
});

const tableHeaders = computed(() => {
  // Generate headers based on current view mode and pivot state
  if (!pivotState.value) return [];
  // Implementation depends on your data structure
});

// Methods
const applyFilter = () => {
  if (selectedField.value && filterValue.value) {
    activeFilters.value.push({
      field: selectedField.value,
      operator: 'contains',
      value: filterValue.value,
    });
    filterValue.value = '';
  }
};

const clearFilters = () => {
  activeFilters.value = [];
};

const toggleViewMode = () => {
  currentViewMode.value =
    currentViewMode.value === 'processed' ? 'raw' : 'processed';
};

const sortByColumn = field => {
  // Implementation for custom sorting
};

const formatCell = value => {
  // Custom cell formatting
  return typeof value === 'number' ? value.toLocaleString() : value;
};

const openDrillDown = row => {
  console.log('Drill down into:', row);
};

// Event handlers
const handleStateChange = state => {
  pivotState.value = state;
};

const handleViewModeChange = data => {
  currentViewMode.value = data.mode;
};

const handlePaginationChange = pagination => {
  currentPage.value = pagination.currentPage;
  totalPages.value = pagination.totalPages;
};
</script>

<style scoped>
.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.filter-controls,
.view-controls,
.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pivot-table {
  width: 100%;
  border-collapse: collapse;
}

.pivot-table th,
.pivot-table td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  text-align: left;
}

.pivot-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.pivot-table th:hover {
  background-color: #e9ecef;
}

.data-row:hover {
  background-color: #f8f9fa;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
}
</style>
```

</details>

### None Mode (Headless) - Complete Customization

None mode provides a completely headless approach where the component is hidden and you build a 100% custom UI.

<details>
<summary>Click to view the complete None Mode (Headless) example</summary>

```vue
<template>
  <div class="headless-pivot">
    <!-- Hidden PivotHead for data processing -->
    <PivotHead
      ref="pivotRef"
      mode="none"
      :data="data"
      :options="options"
      :filters="filters"
      @state-change="handleStateChange"
      @view-mode-change="handleViewMode"
      @pagination-change="handlePaginationChange"
      style="display: none;"
    />

    <!-- Completely custom UI -->
    <div class="custom-interface">
      <header class="control-panel">
        <div class="data-controls">
          <button @click="addRandomData">Add Data</button>
          <button @click="refreshPivot">Refresh</button>
          <button @click="exportToExcel">Export Excel</button>
        </div>

        <div class="filter-panel">
          <input
            v-model="searchTerm"
            placeholder="Search..."
            @input="debounceSearch"
          />
          <select v-model="groupBy" @change="updateGrouping">
            <option value="">No Grouping</option>
            <option value="region">Group by Region</option>
            <option value="product">Group by Product</option>
          </select>
        </div>
      </header>

      <main class="data-display">
        <div v-if="isLoading" class="loading">Loading...</div>

        <div v-else-if="currentViewMode === 'processed'" class="pivot-grid">
          <!-- Custom pivot table implementation -->
          <div
            v-for="(section, index) in processedSections"
            :key="index"
            class="pivot-section"
          >
            <h3>{{ section.title }}</h3>
            <div class="grid">
              <!-- Custom grid rendering -->
            </div>
          </div>
        </div>

        <div v-else class="raw-grid">
          <!-- Custom raw data table -->
          <div class="data-grid">
            <div
              v-for="(item, index) in filteredRawData"
              :key="index"
              class="data-item"
              @click="selectItem(item)"
            >
              <!-- Custom item rendering -->
            </div>
          </div>
        </div>
      </main>

      <footer class="summary-panel">
        <div class="stats">
          <span>Total Records: {{ totalRecords }}</span>
          <span>Visible: {{ visibleRecords }}</span>
          <span>Selected: {{ selectedRecords.length }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();
const isLoading = ref(false);
const searchTerm = ref('');
const groupBy = ref('');
const currentViewMode = ref('processed');
const pivotState = ref(null);
const selectedRecords = ref([]);

// Computed data processing
const processedSections = computed(() => {
  if (!pivotState.value?.processedData) return [];
  // Custom processing logic for your UI
});

const filteredRawData = computed(() => {
  if (!pivotState.value?.rawData) return [];
  // Custom filtering logic
});

const totalRecords = computed(() => pivotState.value?.rawData?.length || 0);
const visibleRecords = computed(() => filteredRawData.value.length);

// Methods
const addRandomData = () => {
  // Add random data and trigger refresh
};

const refreshPivot = () => {
  pivotRef.value?.refresh();
};

const exportToExcel = () => {
  pivotRef.value?.exportToExcel('headless-export');
};

const updateGrouping = () => {
  // Update pivot options based on groupBy selection
};

const selectItem = item => {
  const index = selectedRecords.value.findIndex(r => r.id === item.id);
  if (index > -1) {
    selectedRecords.value.splice(index, 1);
  } else {
    selectedRecords.value.push(item);
  }
};

// Debounced search
let searchTimeout;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // Apply search filter
  }, 300);
};

// Event handlers
const handleStateChange = state => {
  pivotState.value = state;
  isLoading.value = false;
};

const handleViewMode = data => {
  currentViewMode.value = data.mode;
};

const handlePaginationChange = pagination => {
  console.log('Pagination:', pagination);
};
</script>
```

</details>

## Best Practices

### 1. Data Management

- Use `Object.freeze()` for large, static datasets
- Implement proper data validation before passing to the component
- Use computed properties for derived data
- **WASM Optimization**: Use ConnectService for files > 5MB to leverage automatic WASM acceleration

### 2. Performance

- Use `shallowRef` for large arrays to avoid deep reactivity
- Implement virtual scrolling for very large datasets in minimal mode
- Debounce filter operations to avoid excessive re-rendering
- **For Large Files (100MB+)**: Use streaming mode with ConnectService
- **Memory Management**: Freeze large datasets to prevent Vue reactivity overhead

```typescript
//  DO: Freeze large datasets
const largeData = Object.freeze(myLargeArray);

//  DO: Use pagination for 10K+ rows
const pagination = { pageSize: 100 };

//  DO: Debounce filters
import { debounce } from 'lodash';
const updateFilters = debounce(filters => {
  activeFilters.value = filters;
}, 300);

//  DO: Use ConnectService for file uploads
const result = await pivotRef.value.connectToLocalCSV({
  maxRecords: 50000,
  chunkSizeBytes: 5 * 1024 * 1024,
});
```

### 3. WASM Configuration

- **Copy WASM files** to your `public` directory for production builds
- **Vite Setup**: Add WASM files to `assetsInclude` in `vite.config.ts`
- **Verify Mode**: Check `result.performanceMode` to ensure WASM is being used
- **Fallback Gracefully**: WASM automatically falls back to Web Workers if unavailable

```typescript
// vite.config.ts
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@mindfiredigital/pivothead'],
  },
});
```

### 4. Error Handling

- Always use optional chaining when calling template ref methods
- Implement proper loading states
- Handle network errors gracefully
- **ConnectService Errors**: Check `result.error` and `result.validationErrors` for upload failures

```typescript
const result = await pivotRef.value.connectToLocalCSV(options);
if (!result.success) {
  console.error('Upload failed:', result.error);
  if (result.validationErrors) {
    console.error('Validation errors:', result.validationErrors);
  }
}
```

### 5. Accessibility

- Ensure proper ARIA labels in custom minimal mode implementations
- Provide keyboard navigation support
- Test with screen readers

### 6. Testing

- Mock the web component for unit tests
- Test event emissions
- Verify prop reactivity
- Test error conditions

## Conclusion

The PivotHead Vue wrapper represents a sophisticated integration solution that bridges Vue 3 applications with powerful pivot table functionality. By leveraging Vue's reactive system, WebAssembly acceleration, TypeScript support, and component architecture, it provides developers with a flexible and performant tool for data visualization and analysis.

### Key Strengths

- **Seamless Integration**: The wrapper feels native to Vue applications while providing access to advanced pivot functionality
- **WebAssembly Performance**: Industry-leading speed with 30-40% faster processing for large datasets using WASM technology
- **Smart File Loading**: ConnectService provides zero-config uploads with automatic mode selection and progress tracking
- **Progressive Enhancement**: Start with default mode for rapid development, then customize with minimal or none modes as requirements grow
- **Type Safety**: Complete TypeScript support ensures robust development experience and prevents runtime errors
- **Performance Optimized**: Vue-specific optimizations combined with WASM handle massive datasets (10M+ rows) efficiently
- **Developer Experience**: Comprehensive API, extensive documentation, and practical examples accelerate development

### Use Cases

The Vue wrapper excels in:

- **Business Intelligence Dashboards**: Create interactive data exploration interfaces with millions of records
- **Reporting Applications**: Build customizable report viewers with export capabilities and WASM-powered performance
- **Data Analysis Tools**: Develop sophisticated data manipulation and visualization features for large-scale datasets
- **Administrative Panels**: Implement complex data tables with filtering, sorting, and real-time updates
- **Customer-Facing Analytics**: Provide end-users with self-service data analysis capabilities, even with massive files
- **Enterprise Data Processing**: Handle 800MB+ CSV files with streaming + WASM hybrid mode

Whether you're building a simple data display or a complex analytical dashboard processing millions of rows, the PivotHead Vue wrapper provides the foundation for creating powerful, user-friendly data visualization experiences in Vue 3 applications. Its three-mode architecture combined with WebAssembly acceleration ensures that you can start simple and scale to handle enterprise-level data volumes as your requirements evolve, making it an ideal choice for both rapid prototyping and production-ready applications handling massive datasets.
