---
id: core-webcomponent-api-reference
title: Core Web Component API
sidebar_label: Core Web Component
---

# **Core Web Component API Reference**

The `<pivot-head>` **web component** exposes a rich API through HTML attributes (for initial setup) and JavaScript properties, methods, and events (for dynamic interaction).  
This allows developers to easily integrate **headless pivot table** functionality into any web project.

---

## **Methods**

You can call these methods on the DOM element instance (for example, `document.querySelector('pivot-head').refresh()`).

| Method               | Parameters                                        | Returns           | Description                                    |
| -------------------- | ------------------------------------------------- | ----------------- | ---------------------------------------------- |
| `getState()`         | –                                                 | `PivotTableState` | Gets the current component state.              |
| `refresh()`          | –                                                 | `void`            | Refreshes the pivot engine.                    |
| `sort()`             | `field: string`, `direction: 'asc' \| 'desc'`     | `void`            | Sorts the data by a specified field.           |
| `addFilter()`        | `field: string`, `operator: string`, `value: any` | `void`            | Adds a filter to the data.                     |
| `clearFilters()`     | –                                                 | `void`            | Removes all active filters.                    |
| `setPageSize()`      | `size: number`                                    | `void`            | Sets the number of items per page.             |
| `nextPage()`         | –                                                 | `void`            | Navigates to the next page.                    |
| `previousPage()`     | –                                                 | `void`            | Navigates to the previous page.                |
| `exportToPDF()`      | `fileName?: string`                               | `void`            | Exports the current view as a PDF.             |
| `exportToExcel()`    | `fileName?: string`                               | `void`            | Exports the current view as an Excel file.     |
| `exportToHTML()`     | `fileName?: string`                               | `void`            | Exports the current view as an HTML file.      |
| `print()`            | –                                                 | `void`            | Opens the browser’s print dialog.              |
| `setViewMode()`      | `mode: 'processed' \| 'raw'`                      | `void`            | Switches between raw and processed data views. |
| `getRawData()`       | –                                                 | `object[]`        | Gets the original, unfiltered dataset.         |
| `getProcessedData()` | –                                                 | `object`          | Gets the processed pivot data.                 |

---

## **Events**

You can listen for the following events on the DOM element (for example, `pivot.addEventListener('stateChange', ...)`).

| Event          | Detail Type       | Description                                         |
| -------------- | ----------------- | --------------------------------------------------- |
| `stateChange`  | `PivotTableState` | Fired whenever the internal state changes.          |
| `filterChange` | `FilterState`     | Fired when filters are added, removed, or modified. |
| `sortChange`   | `SortState`       | Fired when sorting is applied.                      |
| `pageChange`   | `PaginationState` | Fired when the page changes.                        |

---
