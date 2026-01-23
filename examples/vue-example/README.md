# PivotHead Vue Example

A comprehensive Vue 3 example demonstrating both **Default** and **Minimal** modes of the PivotHead Vue wrapper component, along with a powerful **Analytics** view for data visualization. This example showcases the full functionality of PivotHead in a Vue application with TypeScript support.

## 🚀 Features

### Default Mode (Table View)

- **Complete out-of-the-box solution** with all built-in controls
- Interactive pivot table with sample sales data
- Built-in filtering, sorting, and data manipulation
- Automatic pagination and view mode switching
- Export functionality (Excel, PDF, HTML)
- State management and event handling
- Professional UI with modern styling

### Minimal Mode (Table View)

- **Slot-based customization** for building custom UI
- Custom table rendering with drag-and-drop support
- Manual control over sorting, filtering, and pagination
- Drill-down functionality for detailed data analysis
- Custom column and row ordering
- Raw and processed data view modes
- Full control over table appearance and behavior

### Analytics View (Charts Only)

- **Dedicated chart visualization** - no table, just charts
- **16 chart types** including bar, line, pie, scatter, heatmap, and more
- **Interactive filters** for measures, rows, columns, and limits
- **Direct Chart.js rendering** for optimal performance
- **Floating toggle button** to switch between Table and Analytics views

## 📋 Dependencies

The example uses the following PivotHead packages:

- **@mindfiredigital/pivothead-vue**: Vue wrapper for pivot table functionality
- **@mindfiredigital/pivothead-analytics**: Analytics and charting module (includes Chart.js)
- **@mindfiredigital/pivothead-web-component**: The underlying web component implementation
- **@mindfiredigital/pivothead**: The core pivot engine

### Dependency Chain

```
vue-example
├── @mindfiredigital/pivothead-vue (Vue wrapper)
│   ├── @mindfiredigital/pivothead-web-component (Web component layer)
│   │   └── @mindfiredigital/pivothead (Core engine)
│   └── ...
└── @mindfiredigital/pivothead-analytics (Charts & Analytics)
    ├── @mindfiredigital/pivothead (Core engine)
    └── chart.js (Bundled - no separate install needed)
```

The Vue wrapper provides:

- Vue 3 reactive props integration
- TypeScript support with full type definitions
- Event handling (state-change, view-mode-change, pagination-change)
- Template refs for accessing web component methods
- Slot support for minimal mode customization
- All three modes: default, minimal, and none

The Analytics package provides:

- ChartService for transforming pivot data to chart format
- Chart.js included (no separate installation required)
- Support for 16 chart types
- Filter configuration for customizing visualizations

## 🛠️ Installation & Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

3. **Build for production:**

   ```bash
   pnpm build
   ```

4. **Preview production build:**
   ```bash
   pnpm preview
   ```

## 📊 Sample Data

The example uses a comprehensive sales dataset with the following structure:

```typescript
interface SalesRecord {
  country: string; // Australia, Canada, USA, Germany, France, UK
  category: string; // Accessories, Cars, Electronics, Clothing, Books
  price: number; // Product price
  discount: number; // Applied discount
}
```

## 🔧 Configuration

### Pivot Options

```typescript
const pivotOptions = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'price', caption: 'Sum of Price', aggregation: 'sum' },
    { uniqueName: 'discount', caption: 'Sum of Discount', aggregation: 'sum' },
  ],
  pageSize: 10,
};
```

### Import Styles

The Vue wrapper can be imported in two ways:

```typescript
// Named import (recommended)
import { PivotHead } from '@mindfiredigital/pivothead-vue';

// Default import (also supported)
import PivotHead from '@mindfiredigital/pivothead-vue';
```

## 🎯 Default Mode Features

### Built-in Functionality

- **Data Visualization**: Complete pivot table with cross-tabulation
- **Interactive Controls**: Built-in toolbar with all necessary options
- **Filtering**: Advanced filtering capabilities
- **Sorting**: Multi-level sorting on any field
- **Pagination**: Automatic pagination with configurable page sizes
- **Export**: Excel, PDF, and HTML export options
- **View Modes**: Switch between raw and processed data views
- **Analytics Tab**: In-depth data analysis with charts and insights

### Event Handlers

- `state-change`: Triggered when pivot state updates
- `view-mode-change`: Fires when switching between raw/processed views
- `pagination-change`: Called on page navigation

### Methods

- `refresh()`: Manually refresh the data
- `exportToExcel()`: Export current view to Excel
- `exportToPDF()`: Export current view to PDF
- `setViewMode()`: Programmatically change view mode

## 🎨 Minimal Mode Features

### Custom Components

- **ProcessedTable.vue**: Handles cross-tabulated pivot data
- **RawTable.vue**: Displays raw data with custom controls
- **DrillDownModal.vue**: Shows detailed breakdown of aggregated values
- **MinimalMode.vue**: Main controller component

### Slot-based Architecture

```vue
<PivotHead mode="minimal">
  <template #header>
    <!-- Custom toolbar and controls -->
  </template>
  <template #body>
    <!-- Custom table rendering -->
  </template>
</PivotHead>
```

### Advanced Features

- **Drag & Drop**: Reorder columns and rows via drag-and-drop
- **Custom Filtering**: Build your own filter interface
- **Drill-down**: Click on aggregated values to see underlying records
- **Custom Sorting**: Implement sorting logic for any field
- **State Management**: Full control over UI state and data stores
- **Responsive Design**: Custom responsive table layouts

## 📈 Analytics View

The **Analytics View** provides a dedicated chart-only visualization of your pivot data. Switch between Table and Analytics views using the floating toggle button in the bottom right corner.

### Key Features

- **Chart-Only Display**: Clean visualization without table clutter
- **16 Chart Types**: Comprehensive chart options organized by category
- **Interactive Filters**: Filter by measure, rows, columns, and limit results
- **Direct Chart.js Rendering**: Charts render directly on canvas for optimal performance
- **Floating Toggle Button**: Easy switching between Table and Analytics views

### Supported Chart Types

| Category    | Charts                                    |
| ----------- | ----------------------------------------- |
| Basic       | Column, Bar, Line, Area                   |
| Circular    | Pie, Doughnut                             |
| Stacked     | Stacked Column, Stacked Bar, Stacked Area |
| Combo       | Bar + Line, Area + Line                   |
| Statistical | Scatter, Histogram                        |
| Specialized | Heatmap, Funnel, Sankey                   |

### How It Works

1. Click the **Analytics** button (bottom right) to switch to Analytics view
2. Select a **Chart Type** from the dropdown
3. Configure **Filters** (measure, rows, columns, limit)
4. Click **Apply & Render Chart** to visualize
5. Click the **Table** button to return to table view

### Code Example

```typescript
import {
  ChartService,
  Chart,
  registerables,
} from '@mindfiredigital/pivothead-analytics';

// Register Chart.js components
Chart.register(...registerables);

// Initialize chart service with pivot engine
const chartService = new ChartService(pivotEngine);

// Set filters
chartService.setFilters({
  selectedMeasure: 'price',
  selectedRows: ['USA', 'Canada'],
  limit: 10,
});

// Get chart data and render
const chartData = chartService.getChartData();
new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: { responsive: true },
});
```

## 📁 Project Structure

```
src/
├── App.vue                    # Main application with view/mode switching
│                              # - Table View (Default/Minimal modes)
│                              # - Analytics View (Charts only)
│                              # - Floating toggle button
├── main.ts                    # Vue app initialization
├── components/
│   ├── MinimalMode.vue        # Minimal mode controller
│   ├── ProcessedTable.vue     # Cross-tabulated data table
│   ├── RawTable.vue          # Raw data table
│   ├── DrillDownModal.vue    # Modal for detailed data view
│   └── ...                   # Additional components
└── types/                    # TypeScript type definitions
```

### App.vue Structure

- **Hidden PivotHead**: Always in DOM to maintain engine for ChartService
- **Table View**: Shows Default or Minimal mode pivot table
- **Analytics View**: Shows chart configuration and canvas for Chart.js
- **Floating Toggle**: Fixed button in bottom right corner

## 🔘 Floating Toggle Button

A floating action button in the bottom right corner allows users to switch between Table and Analytics views.

### Features

- **Fixed Position**: Always visible at bottom: 24px, right: 24px
- **Dynamic Icon**: Shows chart icon in Table view, table icon in Analytics view
- **Gradient Styling**: Blue gradient for Table view, purple gradient for Analytics view
- **Hover Effects**: Lift animation and enhanced shadow on hover
- **Responsive**: Adjusts size on mobile devices

### Styling

```css
.floating-toggle-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.floating-toggle-btn.analytics-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🎮 Usage Examples

### Basic Default Mode Setup

```vue
<template>
  <PivotHead
    mode="default"
    :data="salesData"
    :options="pivotOptions"
    @state-change="handleStateChange"
    @view-mode-change="handleViewModeChange"
    @pagination-change="handlePaginationChange"
  />
</template>

<script setup>
import { PivotHead } from '@mindfiredigital/pivothead-vue';
// or: import PivotHead from '@mindfiredigital/pivothead-vue'
</script>
```

### Advanced Minimal Mode Setup

```vue
<template>
  <PivotHead
    mode="minimal"
    :data="data"
    :options="options"
    :filters="filters"
    @state-change="handleStateChange"
    @view-mode-change="handleViewModeChange"
    @pagination-change="handlePaginationChange"
  >
    <template #header>
      <!-- Custom controls -->
      <div class="custom-toolbar">
        <select v-model="filterField">
          <option value="country">Country</option>
          <option value="category">Category</option>
        </select>
        <input v-model="filterValue" placeholder="Filter value" />
        <button @click="applyFilter">Apply Filter</button>
        <button @click="toggleViewMode">Toggle View</button>
      </div>
    </template>
    <template #body>
      <!-- Custom table -->
      <ProcessedTable
        v-if="viewMode === 'processed'"
        :pivot-state="pivotState"
        :current-store="processedStore"
        @toggle-sort="toggleSort"
        @open-drill-down="openDrillDown"
      />
      <RawTable
        v-else
        :pivot-state="pivotState"
        :current-store="rawStore"
        @toggle-sort="toggleSort"
      />
    </template>
  </PivotHead>
</template>

<script setup>
import { PivotHead } from '@mindfiredigital/pivothead-vue';
import ProcessedTable from './ProcessedTable.vue';
import RawTable from './RawTable.vue';
</script>
```

## 🔄 Data Flow

1. **Data Input**: Sample sales data is provided to the PivotHead component
2. **Configuration**: Pivot options define rows, columns, and measures
3. **Processing**: Vue wrapper processes data through the core engine
4. **Rendering**: Based on mode, either built-in or custom UI is rendered
5. **Interaction**: User interactions trigger events and state updates
6. **Updates**: Component reactively updates based on state changes

## 🚀 Performance Features

- **Reactive Updates**: Efficient Vue 3 reactivity system
- **Pagination**: Large datasets are paginated for performance
- **Virtual Scrolling**: Smooth scrolling for large tables
- **Optimized Rendering**: Smart component updates and minimal re-renders
- **Memory Management**: Efficient data structures and cleanup

## 🧪 Development

### TypeScript Support

The project is fully typed with TypeScript, providing:

- Type safety for all data structures
- IntelliSense for PivotHead APIs
- Compile-time error checking
- Better development experience

### Hot Module Replacement

Development server supports HMR for fast development cycles.

### Linting & Formatting

Code quality is maintained through ESLint and Prettier configurations.

## 📖 API Reference

### Props

- `data`: Array of data records
- `options`: Pivot configuration object
- `mode`: 'default' | 'minimal'
- `filters`: Array of filter objects

### Events

- `state-change`: Emitted when internal state changes
- `view-mode-change`: Emitted when view mode switches
- `pagination-change`: Emitted on pagination updates

### Methods (Default Mode)

- `refresh()`: Refresh data and recalculate
- `exportToExcel(filename?)`: Export to Excel format
- `exportToPDF(filename?)`: Export to PDF format
- `exportToHTML(filename?)`: Export to HTML format
- `setViewMode(mode)`: Change view mode programmatically
- `getState()`: Get current pivot state
- `getData()`: Get raw data
- `getProcessedData()`: Get processed/aggregated data
- `sort(field, direction)`: Sort by specific field
- `getPagination()`: Get current pagination state
- `setPageSize(size)`: Change page size
- `goToPage(page)`: Navigate to specific page
- `getFilters()`: Get active filters
- `formatValue(value, field)`: Format specific values
- `updateFieldFormatting(field, format)`: Update field formatting

## 🤝 Contributing

This example serves as a reference implementation. To contribute:

1. Test your changes with both modes
2. Ensure TypeScript compliance
3. Update documentation for any new features
4. Verify all exports and interactions work correctly

## 📄 License

This example is part of the PivotHead project and follows the same licensing terms.

## 🔗 Related

- [PivotHead Core Package](../../packages/core/)
- [PivotHead Vue Wrapper](../../packages/vue/)
- [PivotHead Analytics Package](../../packages/analytics/)
- [Other Examples](../)
- [Documentation](../../docs/)
