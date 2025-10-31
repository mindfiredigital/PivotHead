---
id: react-api-reference
title: React API
sidebar_label: React
---

## Component API Reference

### Props

The PivotHead component accepts the following props:

| Prop         | Type                               | Default     | Description                     |
| ------------ | ---------------------------------- | ----------- | ------------------------------- |
| `mode`       | `'default' \| 'minimal' \| 'none'` | `'default'` | Rendering mode                  |
| `data`       | `PivotDataRecord[]`                | -           | Dataset to analyze              |
| `options`    | `PivotOptions`                     | -           | Pivot configuration             |
| `filters`    | `FilterConfig[]`                   | -           | Active filters                  |
| `pagination` | `Partial<PaginationConfig>`        | -           | Pagination settings             |
| `className`  | `string`                           | -           | CSS class name                  |
| `style`      | `React.CSSProperties`              | -           | Inline styles                   |
| `headerSlot` | `React.ReactNode`                  | -           | Header content for minimal mode |
| `bodySlot`   | `React.ReactNode`                  | -           | Body content for minimal mode   |

### Events

| Event                | Type                                                     | Description                    |
| -------------------- | -------------------------------------------------------- | ------------------------------ |
| `onStateChange`      | `(e: CustomEvent<PivotTableState>) => void`              | Fired when pivot state changes |
| `onViewModeChange`   | `(e: CustomEvent<{mode: 'raw' \| 'processed'}>) => void` | Fired when view mode changes   |
| `onPaginationChange` | `(e: CustomEvent<PaginationConfig>) => void`             | Fired when pagination changes  |

#### Available Methods

| Method                                 | Parameters                                  | Returns                | Description             |
| -------------------------------------- | ------------------------------------------- | ---------------------- | ----------------------- |
| `getState()`                           | -                                           | `PivotTableState`      | Get current state       |
| `refresh()`                            | -                                           | `void`                 | Refresh the pivot       |
| `sort(field, direction)`               | `field: string, direction: 'asc' \| 'desc'` | `void`                 | Sort by field           |
| `setMeasures(measures)`                | `measures: MeasureConfig[]`                 | `void`                 | Update measures         |
| `setDimensions(dimensions)`            | `dimensions: Dimension[]`                   | `void`                 | Update dimensions       |
| `getFilters()`                         | -                                           | `FilterConfig[]`       | Get current filters     |
| `getPagination()`                      | -                                           | `PaginationConfig`     | Get pagination state    |
| `getData()`                            | -                                           | `PivotDataRecord[]`    | Get raw data            |
| `getProcessedData()`                   | -                                           | `unknown`              | Get processed data      |
| `setPageSize(size)`                    | `size: number`                              | `void`                 | Set page size           |
| `goToPage(page)`                       | `page: number`                              | `void`                 | Navigate to page        |
| `nextPage()`                           | -                                           | `void`                 | Go to next page         |
| `previousPage()`                       | -                                           | `void`                 | Go to previous page     |
| `setViewMode(mode)`                    | `mode: 'raw' \| 'processed'`                | `void`                 | Switch view mode        |
| `getViewMode()`                        | -                                           | `'raw' \| 'processed'` | Get current view mode   |
| `exportToHTML(filename?)`              | `filename?: string`                         | `void`                 | Export as HTML          |
| `exportToPDF(filename?)`               | `filename?: string`                         | `void`                 | Export as PDF           |
| `exportToExcel(filename?)`             | `filename?: string`                         | `void`                 | Export as Excel         |
| `openPrintDialog()`                    | -                                           | `void`                 | Open print dialog       |
| `formatValue(value, field)`            | `value: unknown, field: string`             | `string`               | Format a value          |
| `updateFieldFormatting(field, format)` | `field: string, format: FormatOptions`      | `void`                 | Update field formatting |
| `showFormatPopup()`                    | -                                           | `void`                 | Show format dialog      |
