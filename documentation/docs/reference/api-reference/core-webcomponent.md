---
id: core-webcomponent-api-reference
title: Core Web Component API
sidebar_label: Core Web Component
---

# **Core Web Component API Reference**

The `<pivot-head>` **web component** exposes a rich API through HTML attributes (for initial setup) and JavaScript properties, methods, and events (for dynamic interaction).  
This allows developers to easily integrate **headless pivot table** functionality into any web project.

---

## **Properties / Attributes**

## **Methods**

These can be set as **HTML attributes** (using kebab-case, e.g., `data-url`) or as **JavaScript properties** (using camelCase, e.g., `pivot.dataUrl`).

| Property           | Attribute           | Type         | Description                                         |
| ------------------ | ------------------- | ------------ | --------------------------------------------------- |
| `data`             | `data`              | `object[]`   | The raw dataset (as a JSON string in HTML).         |
| `options`          | `options`           | `object`     | The pivot configuration (as a JSON string in HTML). |
| `dataUrl`          | `data-url`          | `string`     | URL to fetch the raw JSON data from.                |
| `optionsUrl`       | `options-url`       | `string`     | URL to fetch the JSON configuration from.           |
| `mode`             | `mode`              | `string`     | Rendering mode: `default`, `minimal`, or `none`.    |
| `filters`          | `filters`           | `Filter[]`   | Sets the active filters.                            |
| `pagination`       | `pagination`        | `Pagination` | Sets the pagination configuration.                  |
| `virtualScrolling` | `virtual-scrolling` | `boolean`    | Enables virtual scrolling for large datasets.       |

## **Events**

You can listen for the following events on the DOM element (for example, `pivot.addEventListener('stateChange', ...)`).

| Event          | Detail Type       | Description                                         |
| -------------- | ----------------- | --------------------------------------------------- |
| `stateChange`  | `PivotTableState` | Fired whenever the internal state changes.          |
| `filterChange` | `FilterState`     | Fired when filters are added, removed, or modified. |
| `sortChange`   | `SortState`       | Fired when sorting is applied.                      |
| `pageChange`   | `PaginationState` | Fired when the page changes.                        |

---
