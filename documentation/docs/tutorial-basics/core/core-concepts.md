---
sidebar_position: 1
title: Core Concepts
description: Understanding the fundamental building blocks of the PivotHead engine.
---

# **Core Concepts**

To effectively use PivotHead, it's crucial to understand the core concepts that power its engine. This page explains the fundamental building blocks of a pivot table and how they are managed by the `PivotEngine` class.

## The Anatomy of a Pivot Table

A pivot table is a powerful tool for summarizing data. It consists of several key components that you define in your configuration.

---

### **1. Data Source and Connectivity**

The foundation of any pivot table is the **raw data**. While this is typically a JavaScript array of objects, PivotHead's core provides powerful data connection capabilities.

#### In-Memory Data

Most commonly, you will provide an array of objects directly in your configuration.

```javascript
const data = [
  { date: '2024-01-01', product: 'Widget A', region: 'North', sales: 1000 },
  // ... more data
];
```

#### Connecting to Local Files

A key feature of PivotHead is the ability to connect directly to local files selected by the user, simplifying data import workflows. The core engine includes services to handle this.

- **CSV & JSON Files**: The engine can parse local CSV and JSON files, with configurable options for delimiters and headers. This simplifies data loading, as you don't need to write your own file-parsing logic.

### **2. Dimensions vs. Measures**

Fields from your data source are categorized as either dimensions or measures.

#### Dimensions 🧊

Dimensions are categorical fields used to group and label your data. They act as the context for your analysis and typically contain text or dates.

- **Examples**: Product names, regions, countries, dates, categories.
- **Usage**: You place dimensions on rows and columns to structure the pivot table.

```javascript
// In your config, you declare which fields can be used as dimensions.
dimensions: [
  { field: 'product', label: 'Product', type: 'string' },
  { field: 'region', label: 'Region', type: 'string' },
],
```

#### Measures 🔢

Measures are the quantifiable, numeric values that you want to analyze and aggregate.

- **Examples**: Sales figures, quantities, costs, temperatures, scores.
- **Usage**: Measures are calculated and displayed in the cells of the pivot table.

```javascript
// In your config, you define which measures to calculate.
measures: [
  {
    uniqueName: 'sales',
    caption: 'Total Sales',
    aggregation: 'sum',
    format: { type: 'currency', currency: 'USD' },
  },
],
```

### **3. Rows, Columns, and Cells**

- **Rows**: Define the horizontal groupings of your data, creating row headers for each unique value of a dimension.
- **Columns**: Define the vertical groupings, creating column headers for each unique value of a dimension.
- **Cells**: Are the intersections of rows and columns, displaying the aggregated measure values.

```javascript
// This config places products on rows and regions on columns.
rows: [{ uniqueName: 'product', caption: 'Product' }],
columns: [{ uniqueName: 'region', caption: 'Region' }],
```

### **4. Aggregations**

Aggregation is the process of summarizing multiple data records into a single value. You define the aggregation method for each measure.

- **sum**: Adds all values.
- **avg**: Calculates the average.
- **count**: Counts the number of records.
- **min**: Finds the minimum value.
- **max**: Finds the largest value.

```javascript
{
  uniqueName: 'sales',
  caption: 'Total Sales',
  aggregation: 'sum',
}
```

## The PivotEngine: Your Data's Brain

The PivotEngine is the heart of PivotHead. It is a UI-agnostic engine that handles all the heavy lifting.

- **Data Processing**: Organizes and aggregates your data based on your configuration.
- **State Management**: Keeps track of the current configuration, including sorting, filtering, and user interactions.
- **Calculations**: Performs all aggregations and applies any custom formulas you define.
- **Formatting**: Provides utilities for applying number, date, and currency formatting to values.

You create a PivotEngine instance by passing it a PivotTableConfig object.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine({
  data: yourData,
  rows: [...],
  columns: [...],
  measures: [...],
});
```

## Fundamental Operations

### **Data Views: Raw vs. Processed**

A core aspect of PivotHead's flexibility is its ability to manage both raw and processed views of your data. This allows developers to create UIs where users can switch between the detailed raw data and the summarized pivot view.

- **Processed Data**: The summarized, aggregated data ready to be displayed as a pivot table. It is the primary output you'll use for rendering.
- **Raw Data**: The original (or filtered) dataset. The engine keeps this accessible, allowing you to build features like "View Source Data" or a raw table view.

### **Grouping and Hierarchies**

You can group data by multiple fields to create expandable and collapsible hierarchies on rows or columns.

```javascript
groupConfig: {
  rowFields: ['category', 'product'], // Creates a hierarchy of category > product
  columnFields: ['year', 'quarter'],
},
```

### **Sorting and Filtering**

The engine provides powerful methods to dynamically sort and filter the dataset.

- **Sorting**: You can sort rows based on their labels or by any measure column, in either ascending or descending order.
- **Filtering**: The engine can apply complex filters to narrow down the dataset based on specific criteria.

## Advanced Capabilities

### Custom Measures & Formulas

Create new measures on the fly using custom formulas. This allows you to derive new insights without modifying your original dataset.

```javascript
// Example: Calculate profit margin from sales and cost fields.
{
  uniqueName: 'profitMargin',
  caption: 'Profit Margin',
  aggregation: 'avg',
  format: { type: 'percentage', decimals: 2 },
  formula: item => (item.sales - item.cost) / item.sales,
}
```

### **Conditional Formatting**

Define rules in your configuration to apply specific styles to cells that meet certain criteria. The engine identifies which cells match, and your rendering logic applies the specified styles.

```javascript
// Example: Highlight high sales values in green.
conditionalFormatting: [
  {
    value: { type: 'Number', operator: 'Greater than', value1: '1000' },
    format: { backgroundColor: '#4CAF50', color: '#ffffff' },
  },
],
```

### **Drill-Down**

Drill-down is the ability to inspect the underlying raw data that contributes to a single aggregated cell. The engine contains the logic to retrieve these specific records, allowing you to build modal dialogs or detailed views that show users exactly which data points make up a summary value.

## Interactivity and Output

### **Dynamic Report Building (Fields Panel)**

A key feature of pivot tables is the "Fields" panel, which allows end-users to drag and drop data fields into different areas (Rows, Columns, Values) to build reports dynamically. As a headless library, PivotHead enables you to build this feature.

As shown in the project examples, a developer can create a UI where user selections call engine methods like `setDimensions()` and `setMeasures()` to reconfigure the pivot table on the fly. This gives you complete freedom to design the fields panel experience.

### **User Interactions**

The core engine includes logic to support a rich, interactive user experience.

- **Drag & Drop**: Methods like `dragRow()` and `dragColumn()` handle the logic for reordering, making it simple to build an interactive drag-and-drop UI.
- **Resizing**: The `resizeRow()` method provides the backend logic for interactive row resizing.

### **Pagination**

For large datasets, the engine includes built-in support for pagination. You can configure page size and navigate through pages of data, ensuring your application remains fast and responsive.

### **Data Export & Printing**

Built-in methods allow you to easily export the current view of your pivot table to different formats or send it to a printer.

- **Export**: The engine provides `exportToHTML()`, `exportToExcel()`, and `exportToPDF()` methods.
- **Print**: The `openPrintDialog()` method prepares the table for printing.

### **Toolbar Visibility**

Your configuration can include a simple boolean to suggest whether a UI toolbar should be shown, which your rendering logic can use to toggle controls.

```javascript
const config = {
  // ... other configuration options
  toolbar: true, // or false
};
```
