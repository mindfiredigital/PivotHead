---
id: core-webcomponent-conceptual-reference
title: Core Web Component Concepts
sidebar_label: Core Web Component
---

The PivotHead Web Component (`@mindfiredigital/pivothead-web-component`) provides a flexible, framework-agnostic solution for integrating pivot table functionality into any web application. Built as a native Web Component, it offers three distinct rendering modes to accommodate different use cases and UI requirements.

## **Overview**

The package wraps the core PivotHead functionality in a custom HTML element (`<pivot-head>`). This approach ensures compatibility with any JavaScript framework or vanilla HTML while providing:

- **Framework Agnostic**: Works with React, Vue, Angular, or plain HTML.
- **Three Rendering Modes**: Choose between a full UI, a slot-based layout, or a completely headless implementation.
- **Rich API**: Complete access to pivot functionality through properties, methods, and events.
- **TypeScript Support**: Full type definitions included for a better development experience.
- **Shadow DOM**: Encapsulated styles prevent CSS conflicts with your application.

## **Installation**

Install the web component package in your project:

```bash
npm install @mindfiredigital/pivothead-web-component
```

Then, import the component in your main JavaScript file to register the < pivot-head > custom element:

```bash

import '@mindfiredigital/pivothead-web-component';
```

## **Anatomy of a Pivot Table**

A pivot table consists of several key components that you define in your configuration.

**1. Data Source and Connectivity**
The foundation of any pivot table is the raw data. While this is typically a JavaScript array of objects, PivotHead's core provides powerful data connection capabilities. A key feature is the ability to connect directly to local files selected by the user, simplifying data import workflows. The core engine includes services to parse local CSV and JSON files, with configurable options for delimiters and headers, so you don't need to write your own file-parsing logic.

**2. Dimensions vs. Measures**
Fields from your data source are categorized as either dimensions or measures.

Dimensions: These are categorical fields used to group and label your data, such as product names, regions, or dates. You place dimensions on rows and columns to structure the pivot table.

Measures : These are the quantifiable, numeric values you want to analyze, like sales figures or quantities. Measures are calculated and displayed in the cells of the pivot table.

**3. Aggregations**
Aggregation is the process of summarizing multiple data records into a single value. You define the aggregation method for each measure, with support for sum, avg, count, min, and max.

**Fundamental Operations**
The engine provides powerful methods to dynamically manipulate the dataset.

**Sorting and Filtering**
You can dynamically sort and filter the dataset.

**Sorting:** You can sort rows based on their labels or by any measure column, in either ascending or descending order.

**Filtering:** The engine can apply complex filters to narrow down the dataset based on specific criteria.

**Grouping and Hierarchies**
Data can be grouped by multiple fields to create expandable and collapsible hierarchies on rows or columns.

```JavaScript

groupConfig: {
  rowFields: ['category', 'product'], // Creates a hierarchy of category > product
  columnFields: ['year', 'quarter'],
},
```

## **Advanced Capabilities**

Custom Measures & Formulas
You can create new measures on the fly using custom formulas, allowing you to derive new insights without modifying your original dataset.

```JavaScript

// Example: Calculate profit margin from sales and cost fields.
{
  uniqueName: 'profitMargin',
  caption: 'Profit Margin',
  aggregation: 'avg',
  format: { type: 'percentage', decimals: 2 },
  formula: item => (item.sales - item.cost) / item.sales,
}
```

**Conditional Formatting**
You can define rules in your configuration to apply specific styles to cells that meet certain criteria. The engine identifies which cells match, and your rendering logic can then apply the specified styles.

**Interactivity and Dynamic Reports**
Dynamic Report Building (Fields Panel)
A key feature of modern pivot tables is the "Fields" panel, which lets users drag and drop data fields into different areas (Rows, Columns, Values) to build their own reports dynamically. As a headless library, PivotHead enables you to build this feature. Your custom UI can call engine methods like setDimensions() and setMeasures() to reconfigure the pivot table on the fly, giving you complete freedom to design the fields panel experience.

**User Interaction Support**
The core engine includes logic to support a rich, interactive user experience.

**Drag & Drop:** Methods like dragRow() and dragColumn() handle the logic for reordering items, making it simple for you to build an interactive drag-and-drop UI.

**Resizing:** The resizeRow() method provides the backend logic for interactive row resizing.

**Rendering Modes**
The web component supports three modes, controlled by the mode attribute.

**Default Mode (Full UI)**
This mode renders a complete pivot table interface with built-in controls, filters, and pagination. It's the quickest way to get a full-featured pivot table running.

Usage:

```HTML

<pivot-head
  data='[{"country":"USA","category":"Bikes","price":1500}]'
  options='{
    "rows":[{"uniqueName":"country","caption":"Country"}],
    "columns":[{"uniqueName":"category","caption":"Category"}],
    "measures":[{"uniqueName":"price","caption":"Total Price","aggregation":"sum"}]
  }'
></pivot-head>
```

When to Use:

For rapid prototyping and demos.

When you need a standard, out-of-the-box pivot table with minimal setup.

**Minimal Mode (Slot-based)**
This mode provides a lightweight container with named slots (header and body), giving you control over the UI while leveraging the component's data processing.

Usage:

```HTML

<pivot-head mode="minimal" id="pivot">
  <div slot="header">
    <button id="exportBtn">Export PDF</button>
  </div>

  <div slot="body">
    <table id="custom-table"></table>
  </div>
</pivot-head>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';
  const pivot = document.getElementById('pivot');
  const table = document.getElementById('custom-table');

  pivot.data = yourDataArray;
  pivot.options = yourOptionsObject;

  pivot.addEventListener('stateChange', e => {
    const state = e.detail;
    // Your custom rendering logic here
    renderMyTable(table, state.processedData);
  });

  document.getElementById('exportBtn').onclick = () => {
    pivot.exportToPDF();
  };
</script>
```

When to Use:

When you need to match your application's specific design system.

For adding custom controls or integrating with existing component libraries.

**None Mode (Headless)**
This mode provides pure data processing without rendering any UI. The component can be hidden, and you interact with it entirely through its JavaScript API to build a completely custom experience.

Usage:

```HTML

<pivot-head id="pivot" mode="none" style="display: none;"></pivot-head>

<div id="my-custom-ui">
  <button id="sortBtn">Sort by Sales</button>
  <div id="results"></div>
</div>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';
  const pivot = document.getElementById('pivot');

  pivot.data = yourDataArray;
  pivot.options = yourOptionsObject;

  pivot.addEventListener('stateChange', e => {
    const state = e.detail;
    // Logic to render your entire UI from scratch
    buildMyUI(state);
  });

  document.getElementById('sortBtn').onclick = () => {
    pivot.sort('sales', 'desc');
  };
</script>
```

When to Use:

For maximum flexibility and complete control over the UI.

When integrating pivot logic into complex or non-tabular data visualizations.
