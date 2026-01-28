---
id: vue-api-reference
title: Vue API
sidebar_label: Vue
---

## API Reference

### Props

| Prop               | Type                               | Default     | Description                                  |
| ------------------ | ---------------------------------- | ----------- | -------------------------------------------- |
| `mode`             | `'default' \| 'minimal' \| 'none'` | `'default'` | Display mode                                 |
| `data`             | `PivotDataRecord[]`                | `undefined` | Input data array                             |
| `options`          | `PivotOptions`                     | `undefined` | Pivot configuration                          |
| `filters`          | `FilterConfig[]`                   | `undefined` | Active filters                               |
| `pagination`       | `Partial<PaginationConfig>`        | `undefined` | Pagination settings                          |
| `class`            | `string`                           | `undefined` | CSS class                                    |
| `style`            | `Record<string, string> \| string` | `undefined` | Inline styles                                |
| `virtualScrolling` | `boolean`                          | `false`     | Enables virtual scrolling for large datasets |

### Template Ref Methods

Access these methods through template refs:

```vue
<template>
  <PivotHead ref="pivotRef" ... />
</template>

<script setup>
const pivotRef = ref();

// Use methods
const exportData = () => {
  pivotRef.value?.exportToExcel('my-data');
};
</script>
```

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
