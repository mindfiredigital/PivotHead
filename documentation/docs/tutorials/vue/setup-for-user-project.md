# setup-for-user-project

A powerful Vue 3 wrapper for PivotHead that provides seamless integration with reactive data binding, TypeScript support, and Vue-specific optimizations. The wrapper bridges Vue applications with the PivotHead web component while maintaining full Vue ecosystem compatibility.

## Overview

The PivotHead Vue wrapper (`@mindfiredigital/pivothead-vue`) offers:

- **Vue 3 Reactivity**: Full integration with Vue's reactive system and deep watching
- **TypeScript Support**: Complete type definitions for all APIs and props
- **Event Bridge**: Converts web component events to Vue events seamlessly
- **Slot System**: Custom slot support for minimal mode customization
- **Template Refs**: Direct access to all underlying web component methods
- **Three Display Modes**: Default, minimal, and none (headless) modes
- **Performance Optimizations**: Vue-specific optimizations for large datasets

## Architecture

### Component Hierarchy

```
Vue Application
├── PivotHead Vue Wrapper
    ├── Web Component Bridge
        ├── @mindfiredigital/pivothead-web-component
            └── @mindfiredigital/pivothead (Core Engine)
```

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
```

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

#### Core Methods

- `getState()` - Get current pivot state
- `refresh()` - Refresh the pivot table
- `getData()` - Get raw input data
- `getProcessedData()` - Get processed pivot data

#### Filtering & Sorting

- `sort(field: string, direction: 'asc' | 'desc')` - Sort by field
- `getFilters()` - Get current filters
- `getFilteredData()` - Get filtered raw data
- `getFilteredAndProcessedData()` - Get filtered and processed data

#### Configuration

- `setMeasures(measures: MeasureConfig[])` - Update measures
- `setDimensions(dimensions: Dimension[])` - Update dimensions
- `setGroupConfig(config: GroupConfig)` - Update grouping

#### Formatting

- `formatValue(value: unknown, field: string)` - Format a value
- `updateFieldFormatting(field: string, format: FormatOptions)` - Update field formatting
- `getFieldAlignment(field: string)` - Get field text alignment
- `showFormatPopup()` - Show formatting popup

#### Pagination

- `getPagination()` - Get pagination state
- `previousPage()` - Go to previous page
- `nextPage()` - Go to next page
- `setPageSize(size: number)` - Set page size
- `goToPage(page: number)` - Go to specific page

#### View Modes

- `setViewMode(mode: 'raw' | 'processed')` - Set view mode
- `getViewMode()` - Get current view mode

#### Export

- `exportToHTML(fileName?: string)` - Export to HTML
- `exportToPDF(fileName?: string)` - Export to PDF
- `exportToExcel(fileName?: string)` - Export to Excel
- `openPrintDialog()` - Open print dialog

#### Drag & Drop

- `swapRows(from: number, to: number)` - Swap row positions
- `swapColumns(from: number, to: number)` - Swap column positions

## Best Practices

### 1. Data Management

- Use `Object.freeze()` for large, static datasets
- Implement proper data validation before passing to the component
- Use computed properties for derived data

### 2. Performance

- Use `shallowRef` for large arrays to avoid deep reactivity
- Implement virtual scrolling for very large datasets in minimal mode
- Debounce filter operations to avoid excessive re-rendering

### 3. Error Handling

- Always use optional chaining when calling template ref methods
- Implement proper loading states
- Handle network errors gracefully

### 4. Accessibility

- Ensure proper ARIA labels in custom minimal mode implementations
- Provide keyboard navigation support
- Test with screen readers

### 5. Testing

- Mock the web component for unit tests
- Test event emissions
- Verify prop reactivity
- Test error conditions

## Conclusion

The PivotHead Vue wrapper represents a sophisticated integration solution that bridges Vue 3 applications with powerful pivot table functionality. By leveraging Vue's reactive system, TypeScript support, and component architecture, it provides developers with a flexible and performant tool for data visualization and analysis.

### Key Strengths

- **Seamless Integration**: The wrapper feels native to Vue applications while providing access to advanced pivot functionality
- **Progressive Enhancement**: Start with default mode for rapid development, then customize with minimal or none modes as requirements grow
- **Type Safety**: Complete TypeScript support ensures robust development experience and prevents runtime errors
- **Performance Optimized**: Vue-specific optimizations handle large datasets efficiently while maintaining reactivity
- **Developer Experience**: Comprehensive API, extensive documentation, and practical examples accelerate development

### Use Cases

The Vue wrapper excels in:

- **Business Intelligence Dashboards**: Create interactive data exploration interfaces
- **Reporting Applications**: Build customizable report viewers with export capabilities
- **Data Analysis Tools**: Develop sophisticated data manipulation and visualization features
- **Administrative Panels**: Implement complex data tables with filtering and sorting
- **Customer-Facing Analytics**: Provide end-users with self-service data analysis capabilities

Whether you're building a simple data display or a complex analytical dashboard, the PivotHead Vue wrapper provides the foundation for creating powerful, user-friendly data visualization experiences in Vue 3 applications. Its three-mode architecture ensures that you can start simple and scale complexity as your requirements evolve, making it an ideal choice for both rapid prototyping and production-ready applications.
