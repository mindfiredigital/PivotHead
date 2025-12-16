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

---

## **Connect Service & File Upload**

PivotHead provides a powerful **Connect Service** that enables seamless integration with local files, allowing users to upload CSV and JSON files directly into the pivot table. This service includes built-in WebAssembly optimization for handling large files efficiently.

### **Overview**

The Connect Service provides:

- **Local File Upload**: Direct upload of CSV/JSON files from user's device
- **WebAssembly Integration**: Automatic WASM acceleration for large files (800 MB+)
- **Streaming Support**: Memory-efficient processing for massive datasets
- **Progress Tracking**: Real-time upload and processing feedback
- **Error Handling**: Robust validation and error recovery

### **File Upload Methods**

#### **1. connectToLocalFile()**

Generic method for uploading CSV or JSON files with automatic format detection.

```javascript
import '@mindfiredigital/pivothead-web-component';

const pivot = document.querySelector('pivot-head');

// Basic usage
const result = await pivot.connectToLocalFile({
  maxFileSize: 1024 * 1024 * 1024, // 1 GB max (default)
  onProgress: progress => {
    console.log(`Upload progress: ${progress}%`);
  },
});

if (result.success) {
  console.log('File uploaded successfully!');
  console.log(`Records: ${result.recordCount}`);
  console.log(`Performance Mode: ${result.performanceMode}`);
}
```

**Options:**

| Option        | Type       | Default | Description                |
| ------------- | ---------- | ------- | -------------------------- |
| `maxFileSize` | `number`   | 1 GB    | Maximum file size in bytes |
| `onProgress`  | `function` | null    | Progress callback function |

**Return Value:**

```typescript
{
  success: boolean;
  fileName: string;
  fileSize: number;
  recordCount: number;
  performanceMode: 'standard' | 'workers' | 'wasm' | 'streaming-wasm';
  error?: string;
}
```

#### **2. connectToLocalCSV()**

Specialized method for CSV files with advanced parsing options.

```javascript
const result = await pivot.connectToLocalCSV({
  // File size limits
  maxFileSize: 1024 * 1024 * 1024, // 1 GB

  // CSV parsing options
  csv: {
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true,
    trimValues: true,
    encoding: 'utf-8',
  },

  // Progress tracking
  onProgress: progress => {
    updateProgressBar(progress);
  },
});
```

**CSV Options:**

| Option           | Type      | Default   | Description                   |
| ---------------- | --------- | --------- | ----------------------------- |
| `delimiter`      | `string`  | `,`       | Field separator character     |
| `hasHeader`      | `boolean` | `true`    | First row contains headers    |
| `skipEmptyLines` | `boolean` | `true`    | Skip blank rows               |
| `trimValues`     | `boolean` | `true`    | Remove whitespace from values |
| `encoding`       | `string`  | `'utf-8'` | File character encoding       |

### **WebAssembly Performance**

The Connect Service automatically leverages WebAssembly for large files, providing massive performance improvements:

#### **Automatic Mode Selection**

```javascript
// The system automatically chooses the optimal processing mode:

// Small files (< 1 MB): Standard JavaScript
const result = await pivot.connectToLocalFile();
// performanceMode: 'standard'

// Medium files (1-5 MB): Web Workers
const result = await pivot.connectToLocalFile();
// performanceMode: 'workers'

// Large files (5-8 MB): Pure WASM
const result = await pivot.connectToLocalFile();
// performanceMode: 'wasm'

// Very large files (> 8 MB, up to 800 MB): Streaming + WASM Hybrid
const result = await pivot.connectToLocalFile();
// performanceMode: 'streaming-wasm'
```

#### **Performance Metrics**

For an **800 MB CSV file**:

| Metric              | Standard JS | Streaming + WASM     | Improvement |
| ------------------- | ----------- | -------------------- | ----------- |
| **Processing Time** | Would crash | 2-3 seconds          | Works!      |
| **Memory Usage**    | > 2 GB      | ~50 MB               | 40x less    |
| **Parse Speed**     | N/A         | ~200ms per 4MB chunk | 37x faster  |

### **Complete Example: Large File Upload**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Large File Upload Demo</title>
  </head>
  <body>
    <div>
      <button id="uploadBtn">Upload Large CSV File</button>
      <div id="progress" style="display: none;">
        <div
          id="progressBar"
          style="width: 0%; height: 20px; background: #4CAF50;"
        ></div>
        <span id="progressText">0%</span>
      </div>
      <div id="status"></div>
    </div>

    <pivot-head id="pivot" mode="none" style="display: none;"></pivot-head>

    <div id="results"></div>

    <script type="module">
      import '@mindfiredigital/pivothead-web-component';

      const pivot = document.getElementById('pivot');
      const uploadBtn = document.getElementById('uploadBtn');
      const progressDiv = document.getElementById('progress');
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progressText');
      const statusDiv = document.getElementById('status');
      const resultsDiv = document.getElementById('results');

      uploadBtn.addEventListener('click', async () => {
        try {
          statusDiv.textContent = 'Uploading file...';
          progressDiv.style.display = 'block';

          const result = await pivot.connectToLocalFile({
            maxFileSize: 1024 * 1024 * 1024, // 1 GB
            onProgress: progress => {
              progressBar.style.width = `${progress}%`;
              progressText.textContent = `${progress}%`;
            },
          });

          if (result.success) {
            statusDiv.innerHTML = `
            File uploaded successfully!<br>
             File: ${result.fileName}<br>
             Records: ${result.recordCount.toLocaleString()}<br>
             Mode: ${result.performanceMode}<br>
             Size: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB
          `;

            // Get the processed data
            const state = pivot.getState();

            // Render your custom UI
            renderTable(state.data);
          } else {
            statusDiv.textContent = ` Upload failed: ${result.error}`;
          }
        } catch (error) {
          statusDiv.textContent = ` Error: ${error.message}`;
        } finally {
          progressDiv.style.display = 'none';
        }
      });

      function renderTable(data) {
        // Your custom table rendering logic
        resultsDiv.innerHTML = `
        <h3>Data Preview (first 100 rows)</h3>
        <table>
          ${data
            .slice(0, 100)
            .map(
              row => `
            <tr>${Object.values(row)
              .map(val => `<td>${val}</td>`)
              .join('')}</tr>
          `
            )
            .join('')}
        </table>
      `;
      }
    </script>
  </body>
</html>
```

### **WASM Setup for Demos**

For development and demo projects, ensure WASM files are available:

#### **Vite Configuration**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'copy-wasm-files',
      buildStart() {
        const wasmSource = resolve(
          __dirname,
          'node_modules/@mindfiredigital/pivothead/dist/wasm/csvParser.wasm'
        );
        const wasmDest = resolve(__dirname, 'public/wasm/csvParser.wasm');
        const wasmDir = resolve(__dirname, 'public/wasm');

        if (!existsSync(wasmDir)) {
          mkdirSync(wasmDir, { recursive: true });
        }

        if (existsSync(wasmSource)) {
          copyFileSync(wasmSource, wasmDest);
          console.log('✅ Copied WASM file to public/wasm/');
        }
      },
    },
  ],
  server: {
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
});
```

### **Error Handling**

```javascript
try {
  const result = await pivot.connectToLocalFile();

  if (!result.success) {
    // Handle specific errors
    switch (result.error) {
      case 'FILE_TOO_LARGE':
        alert('File is too large. Maximum size is 1 GB.');
        break;
      case 'INVALID_FORMAT':
        alert('Invalid file format. Please upload a CSV or JSON file.');
        break;
      case 'PARSE_ERROR':
        alert('Failed to parse file. Please check the file format.');
        break;
      default:
        alert(`Upload failed: ${result.error}`);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
  alert('An unexpected error occurred during file upload.');
}
```

### **Console Output Example**

When uploading an 1 GB CSV file:

```
 Large file detected (1 GB). Using Streaming + WASM hybrid mode...
 Loading WebAssembly CSV parser...
 Loading WASM from: /wasm/csvParser.wasm
 WASM file loaded successfully (3555 bytes)
 WebAssembly CSV parser loaded successfully (v1520)
Processing with WASM, chunk size: 4 MB
Processing CSV with WebAssembly...
WASM parsed: 52,776 rows, 6 columns
WASM processing completed in 289.50ms
Chunk 0 processed: 52,774 rows (total: 52,774)
WASM parsed: 52,756 rows, 6 columns
WASM processing completed in 192.50ms
Chunk 1 processed: 52,755 rows (total: 105,529)
...
File processing complete: 2,000,000 rows in 2.8 seconds
```

### **Best Practices**

1. **Always show progress feedback** for large files
2. **Handle errors gracefully** with user-friendly messages
3. **Set appropriate file size limits** based on your use case
4. **Test with various file sizes** to verify performance
5. **Use WASM for production** deployments handling large datasets
6. **Implement proper loading states** during file processing
7. **Validate file format** before processing

---
