---
id: angular-conceptual-reference
title: Angular Concepts
sidebar_label: Angular
---

# Angular Wrapper

The PivotHead Angular Wrapper (`@mindfiredigital/pivothead-angular`) is a powerful, type-safe Angular component that bridges Angular applications with the PivotHead Web Component. It provides a seamless Angular developer experience with full TypeScript support, reactive data binding, and Angular-specific optimizations while preserving all the functionality and modes of the underlying web component.

## Overview

The Angular wrapper serves as an intelligent bridge that:

- **Preserves All Web Component Functionality**: Supports all three modes (default, minimal, none) with full feature parity
- **Provides Angular-Native API**: Type-safe inputs, outputs, and ViewChild references that feel natural in Angular applications
- **Handles Angular-Specific Concerns**: Proper change detection, lifecycle hooks, and event emitting
- **Maintains Performance**: Efficient updates and minimal re-rendering through smart change detection
- **Offers Full TypeScript Support**: Complete type definitions for all inputs, outputs, and methods
- **Supports Standalone Components**: Built as a standalone component for modern Angular applications
- **File Import Capabilities**: Native support for CSV, JSON, and file uploads with WebAssembly acceleration

## Architecture

### Bridge Design

The wrapper acts as a bridge between Angular's component paradigm and the Web Component's custom element API:

```
Angular App → Angular Wrapper → Web Component → PivotHead Engine
    ↑            ↑                  ↑              ↑
 Templates    ViewChild         Custom Element   Core Logic
```

### Key Components

- **PivotHeadWrapperComponent**: Main Angular wrapper component
- **Type Definitions**: Comprehensive TypeScript interfaces exported from the package
- **Event Emitters**: Angular-friendly @Output() decorators for all events
- **Input Properties**: Reactive @Input() decorators for data and configuration
- **ViewChild Reference**: Direct access to web component methods via template reference
- **ConnectService Integration**: Built-in file import with WebAssembly and Web Workers

## Installation

Install the Angular wrapper in your Angular project:

```bash
npm install @mindfiredigital/pivothead-angular
```

The wrapper automatically includes the web component as a dependency, so no additional installations are needed.

### Peer Dependencies

- Angular ≥ 18
- TypeScript ≥ 5.4

### Importing the Component

The component is standalone and can be imported directly:

```typescript
import { Component } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `<pivot-head-wrapper [data]="salesData" [options]="options" />`,
})
export class SalesDashboardComponent {
  // Component logic
}
```

## Basic Usage

### Simple Integration

```typescript
import { Component } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  PivotOptions,
  PivotDataRecord,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-basic-pivot',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <h1>Sales Dashboard</h1>
      <pivot-head-wrapper
        [mode]="'default'"
        [data]="salesData"
        [options]="options"
        (dataLoaded)="onDataLoaded($event)"
        (error)="onError($event)"
      />
    </div>
  `,
})
export class BasicPivotComponent {
  salesData: PivotDataRecord[] = [
    { country: 'USA', category: 'Electronics', sales: 1500, discount: 150 },
    { country: 'Canada', category: 'Cars', sales: 1800, discount: 90 },
    {
      country: 'Australia',
      category: 'Accessories',
      sales: 1200,
      discount: 120,
    },
  ];

  options: PivotOptions = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
      { uniqueName: 'discount', caption: 'Total Discount', aggregation: 'sum' },
    ],
  };

  onDataLoaded(event: any) {
    console.log('Data loaded:', event.recordCount, 'records');
  }

  onError(event: any) {
    console.error('Error:', event.message);
  }
}
```

## Three Rendering Modes

The Angular wrapper supports all three modes from the web component, each optimized for different use cases:

### 1. Default Mode

Complete UI rendered by the component with built-in controls and functionality.

**Features:**

- Full pivot table UI with rows, columns, and measures
- Built-in controls for view switching, pagination, and export
- Drag & drop support for reordering
- Format popup for value formatting
- Export to HTML, PDF, and Excel
- Print functionality

**Example:**

```typescript
import { Component, ViewChild } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-default-mode',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="controls">
        <button (click)="switchToRawData()">View Raw Data</button>
        <button (click)="handleExport()">Export Excel</button>
        <button (click)="showFormatting()">Format Values</button>
      </div>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        [data]="salesData"
        [options]="options"
        (stateChange)="onStateChange($event)"
        (viewModeChange)="onViewModeChange($event)"
      />
    </div>
  `,
})
export class DefaultModeComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  salesData = [
    { country: 'USA', category: 'Electronics', sales: 1500 },
    { country: 'Canada', category: 'Cars', sales: 1800 },
  ];

  options = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    ],
  };

  switchToRawData() {
    this.pivotTable.setViewMode('raw');
  }

  handleExport() {
    this.pivotTable.exportToExcel('sales-report');
  }

  showFormatting() {
    this.pivotTable.showFormatPopup();
  }

  onStateChange(event: any) {
    console.log('Pivot state changed:', event);
  }

  onViewModeChange(event: any) {
    console.log('View mode:', event.mode);
  }
}
```

### 2. Minimal Mode

Slot-based architecture where you provide custom header and body components using Angular content projection.

**Features:**

- Core pivot logic without built-in UI
- Custom header and body via Angular slots
- Full access to processed pivot data
- Complete styling control
- Event-driven architecture

**Example:**

```typescript
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotTableState } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-minimal-mode',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div>
      <pivot-head-wrapper
        #pivotTable
        [mode]="'minimal'"
        [data]="salesData"
        [options]="options"
        (stateChange)="handleStateChange($event)"
      >
        <!-- Custom Header Slot -->
        <div slot="header" class="custom-header">
          <h2>Custom Pivot Table</h2>
          <div class="controls">
            <button (click)="refresh()">Refresh</button>
            <button (click)="reset()">Reset</button>
            <button (click)="exportData()">Export</button>
          </div>
        </div>

        <!-- Custom Body Slot -->
        <div slot="body" class="custom-body">
          @if (pivotState) {
            <div class="stats">
              <p>Total Records: {{ pivotState.data?.length || 0 }}</p>
              <p>View Mode: {{ pivotState.viewMode }}</p>
            </div>

            <table class="custom-table">
              <thead>
                <tr>
                  @for (header of getHeaders(); track header) {
                    <th>{{ header }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of getRows(); track $index) {
                  <tr>
                    @for (cell of row; track $index) {
                      <td>{{ cell }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </pivot-head-wrapper>
    </div>
  `,
  styles: [
    `
      .custom-header {
        padding: 1rem;
        background: #f5f5f5;
        border-bottom: 2px solid #667eea;
      }

      .custom-body {
        padding: 1rem;
      }

      .custom-table {
        width: 100%;
        border-collapse: collapse;
      }

      .custom-table th,
      .custom-table td {
        padding: 0.75rem;
        border: 1px solid #ddd;
        text-align: left;
      }

      .custom-table th {
        background: #667eea;
        color: white;
        font-weight: 600;
      }
    `,
  ],
})
export class MinimalModeComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  salesData = [
    { country: 'USA', category: 'Electronics', sales: 1500 },
    { country: 'Canada', category: 'Cars', sales: 1800 },
  ];

  options = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    ],
  };

  pivotState: PivotTableState<any> | null = null;

  handleStateChange(state: PivotTableState<any>) {
    this.pivotState = state;
  }

  getHeaders(): string[] {
    if (!this.pivotState?.data?.[0]) return [];
    return Object.keys(this.pivotState.data[0]);
  }

  getRows(): any[][] {
    if (!this.pivotState?.data) return [];
    return this.pivotState.data.map(row => Object.values(row));
  }

  refresh() {
    this.pivotTable.refresh();
  }

  reset() {
    this.pivotTable.reset();
  }

  exportData() {
    this.pivotTable.exportToExcel('custom-report');
  }
}
```

### 3. None Mode

Headless mode with no UI - pure data processing logic only.

**Features:**

- Pure pivot engine access
- Complete UI control
- Programmatic data access
- Perfect for custom visualizations
- Minimal overhead

**Example:**

```typescript
import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotTableState } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-headless-mode',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div>
      <pivot-head-wrapper
        #pivotTable
        [mode]="'none'"
        [data]="salesData"
        [options]="options"
        (stateChange)="handleStateChange($event)"
      />

      <div class="dashboard">
        <h2>Custom Dashboard</h2>

        <div class="metrics">
          <div class="metric-card">
            <h3>Total Records</h3>
            <p class="value">{{ pivotState?.data?.length || 0 }}</p>
          </div>

          <div class="metric-card">
            <h3>Total Sales</h3>
            <p class="value">{{ calculateTotalSales() | number: '1.2-2' }}</p>
          </div>
        </div>

        <div class="custom-visualization">
          @for (item of pivotState?.data || []; track $index) {
            <div class="data-card">
              <h4>{{ item.country }}</h4>
              <p>Category: {{ item.category }}</p>
              <p>Sales: {{ item.sales | number: '1.2-2' }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .metric-card {
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .metric-card h3 {
        margin: 0 0 0.5rem 0;
        color: #666;
        font-size: 0.875rem;
      }

      .metric-card .value {
        margin: 0;
        font-size: 2rem;
        font-weight: bold;
        color: #667eea;
      }

      .custom-visualization {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .data-card {
        padding: 1rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    `,
  ],
})
export class HeadlessModeComponent implements OnInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  salesData = [
    { country: 'USA', category: 'Electronics', sales: 1500 },
    { country: 'Canada', category: 'Cars', sales: 1800 },
    { country: 'Australia', category: 'Accessories', sales: 1200 },
  ];

  options = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    ],
  };

  pivotState: PivotTableState<any> | null = null;

  ngOnInit() {
    // Programmatically access the pivot engine
    setTimeout(() => {
      const state = this.pivotTable.getState();
      console.log('Initial state:', state);
    }, 100);
  }

  handleStateChange(state: PivotTableState<any>) {
    this.pivotState = state;
  }

  calculateTotalSales(): number {
    if (!this.pivotState?.data) return 0;
    return this.pivotState.data.reduce(
      (sum: number, item: any) => sum + (item.sales || 0),
      0
    );
  }
}
```

## File Import Capabilities

The Angular wrapper provides comprehensive file import capabilities with support for CSV, JSON, and generic file uploads. It features automatic WebAssembly acceleration and Web Workers for optimal performance.

### ConnectService Integration

The wrapper exposes all ConnectService methods for seamless file importing:

```typescript
import { Component, ViewChild } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  ConnectionOptions,
  FileConnectionResult,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-file-import',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <h2>File Import Demo</h2>

      <div class="import-controls">
        <button (click)="importCSV()">Import CSV</button>
        <button (click)="importJSON()">Import JSON</button>
        <button (click)="importAnyFile()">Import Any File</button>

        <input
          type="file"
          (change)="handleFileUpload($event)"
          accept=".csv,.json"
          #fileInput
        />
      </div>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        (dataLoaded)="onDataLoaded($event)"
        (error)="onError($event)"
      />

      @if (importResult) {
        <div class="result">
          <h3>Import Result</h3>
          <p>Status: {{ importResult.success ? 'Success' : 'Failed' }}</p>
          <p>Records: {{ importResult.recordCount?.toLocaleString() }}</p>
          <p>File Size: {{ formatBytes(importResult.fileSize || 0) }}</p>
          <p>Parse Time: {{ importResult.parseTime }}ms</p>
          <p>Performance Mode: {{ importResult.performanceMode }}</p>
        </div>
      }
    </div>
  `,
})
export class FileImportComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  importResult: FileConnectionResult | null = null;

  // CSV Import with full configuration
  async importCSV() {
    const options: ConnectionOptions = {
      csv: {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1GB - WebAssembly is automatically used when available
      useWorkers: true,
      workerCount: 4, // Use 4 workers for parallel processing
      chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks for streaming
    };

    try {
      const result = await this.pivotTable.connectToLocalCSV(options);
      this.importResult = result || null;
      console.log('CSV Import Result:', result);
    } catch (error: any) {
      console.error('CSV Import Error:', error);
    }
  }

  // JSON Import with schema validation
  async importJSON() {
    const options: ConnectionOptions = {
      json: {
        validateSchema: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      useWorkers: true,
      workerCount: 4,
    };

    try {
      const result = await this.pivotTable.connectToLocalJSON(options);
      this.importResult = result || null;
      console.log('JSON Import Result:', result);
    } catch (error: any) {
      console.error('JSON Import Error:', error);
    }
  }

  // Import any supported file type
  async importAnyFile() {
    const options: ConnectionOptions = {
      csv: {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
      },
      json: {
        validateSchema: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      useWorkers: true,
      workerCount: 4,
      chunkSizeBytes: 1024 * 1024 * 10,
    };

    try {
      const result = await this.pivotTable.connectToLocalFile(options);
      this.importResult = result || null;
      console.log('File Import Result:', result);
    } catch (error: any) {
      console.error('File Import Error:', error);
    }
  }

  // Handle file input upload
  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      try {
        await this.pivotTable.loadFromFile(file);
        console.log('File loaded:', file.name);
      } catch (error: any) {
        console.error('File load error:', error);
      }
    }
  }

  onDataLoaded(event: any) {
    console.log('Data loaded:', event.recordCount, 'records');
  }

  onError(event: any) {
    console.error('Error:', event.message, event.code);
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
```

### Load from URL

Load data directly from a remote URL:

```typescript
async loadFromRemoteURL() {
  const dataUrl = 'https://example.com/data/sales.csv';

  try {
    await this.pivotTable.loadFromUrl(dataUrl);
    console.log('Data loaded from URL');
  } catch (error: any) {
    console.error('URL load error:', error);
  }
}
```

### Connection Options

Complete configuration for file imports:

```typescript
interface ConnectionOptions {
  // CSV-specific options
  csv?: {
    delimiter?: string; // Default: ','
    hasHeader?: boolean; // Default: true
    skipEmptyLines?: boolean; // Default: true
    trimValues?: boolean; // Default: true
    encoding?: string; // Default: 'utf-8'
  };

  // JSON-specific options
  json?: {
    validateSchema?: boolean; // Default: false
  };

  // General options
  maxFileSize?: number; // Maximum file size in bytes (default: 100MB)
  maxRecords?: number; // Maximum number of records to import
  onProgress?: (progress: number) => void; // Progress callback (0-100)

  // Performance options
  useWorkers?: boolean; // Enable Web Workers (default: false)
  workerCount?: number; // Number of workers (default: navigator.hardwareConcurrency)
  chunkSizeBytes?: number; // Chunk size for streaming (default: 1MB)
}
```

### WebAssembly & Web Workers

The file import system automatically uses WebAssembly for maximum performance when available, with graceful fallback to Web Workers:

**Performance Strategy:**

1. **WebAssembly (Fastest)** - If WASM module is available, uses compiled AssemblyScript for CSV parsing
2. **Web Workers (Fast)** - Falls back to parallel processing with multiple workers
3. **Synchronous (Fallback)** - Final fallback for older browsers

**Example with Performance Optimization:**

```typescript
const options: ConnectionOptions = {
  csv: {
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true,
    trimValues: true,
  },
  maxFileSize: 1024 * 1024 * 1024, // 1GB - Large file support
  useWorkers: true, // Enable parallel processing
  workerCount: 4, // Use 4 workers
  chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks for streaming
  onProgress: progress => {
    console.log(`Import progress: ${progress}%`);
  },
};

const result = await this.pivotTable.connectToLocalCSV(options);

// Performance metrics
console.log('Performance Mode:', result?.performanceMode); // 'wasm', 'workers', or 'sync'
console.log('Parse Time:', result?.parseTime, 'ms');
console.log('Records:', result?.recordCount);
```

## Component API

### Inputs (@Input)

| Property     | Type                               | Default     | Description                                   |
| ------------ | ---------------------------------- | ----------- | --------------------------------------------- |
| `data`       | `PivotDataRecord[]`                | `undefined` | Array of data objects to process              |
| `options`    | `PivotOptions`                     | `undefined` | Pivot configuration (rows, columns, measures) |
| `filters`    | `FilterConfig[]`                   | `undefined` | Array of filter configurations                |
| `pagination` | `PaginationConfig`                 | `undefined` | Pagination settings                           |
| `mode`       | `'default' \| 'minimal' \| 'none'` | `'default'` | Rendering mode                                |

### Outputs (@Output)

| Event              | Payload                                      | Description                      |
| ------------------ | -------------------------------------------- | -------------------------------- |
| `stateChange`      | `PivotTableState`                            | Emitted when pivot state changes |
| `viewModeChange`   | `{ mode: 'raw' \| 'processed' }`             | Emitted when view mode switches  |
| `paginationChange` | `PaginationConfig`                           | Emitted when pagination changes  |
| `dataLoaded`       | `{ recordCount: number, fileSize?: number }` | Emitted when data is loaded      |
| `error`            | `{ message: string, code?: string }`         | Emitted when an error occurs     |

### Public Methods

Access these methods via ViewChild reference:

**State Management:**

```typescript
getState(): PivotTableState | undefined
refresh(): void
reset(): void
```

**Data Operations:**

```typescript
getData(): PivotDataRecord[] | undefined
getProcessedData(): unknown | undefined
getRawData(): PivotDataRecord[] | undefined
```

**Sorting & Filtering:**

```typescript
sort(field: string, direction: 'asc' | 'desc'): void
getFilters(): FilterConfig[] | undefined
```

**Configuration:**

```typescript
setMeasures(measures: MeasureConfig[]): void
setDimensions(dimensions: Dimension[]): void
setGroupConfig(config: GroupConfig | null): void
```

**Pagination:**

```typescript
getPagination(): PaginationConfig | undefined
setPageSize(size: number): void
goToPage(page: number): void
previousPage(): void
nextPage(): void
```

**View Control:**

```typescript
setViewMode(mode: 'raw' | 'processed'): void
getViewMode(): 'raw' | 'processed' | undefined
```

**Formatting:**

```typescript
formatValue(value: unknown, field: string): string | undefined
updateFieldFormatting(field: string, format: FormatOptions): void
getFieldAlignment(field: string): string | undefined
showFormatPopup(): void
```

**Export:**

```typescript
exportToHTML(fileName?: string): void
exportToPDF(fileName?: string): void
exportToExcel(fileName?: string): void
openPrintDialog(): void
```

**Drag & Drop:**

```typescript
swapRows(from: number, to: number): void
swapColumns(from: number, to: number): void
dragRow(fromIndex: number, toIndex: number): void
dragColumn(fromIndex: number, toIndex: number): void
setDragAndDropEnabled(enabled: boolean): void
isDragAndDropEnabled(): boolean | undefined
```

**File Import:**

```typescript
loadFromFile(file: File): Promise<void>
loadFromUrl(url: string): Promise<void>
connectToLocalCSV(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
connectToLocalJSON(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
connectToLocalFile(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
```

**Field Introspection:**

```typescript
getAvailableFields(): FieldInfo[] | undefined
getSupportedAggregations(): AggregationType[] | undefined
setMeasureAggregation(field: string, aggregation: AggregationType): void
buildLayout(selection: LayoutSelection): void
```

**Grouping:**

```typescript
getGroupedData(): Group[] | undefined
```

## TypeScript Support

The package exports comprehensive TypeScript types for an excellent developer experience:

```typescript
import type {
  // Core Types
  PivotHeadElement,
  PivotOptions,
  PivotDataRecord,
  PivotTableState,

  // Configuration Types
  FilterConfig,
  PaginationConfig,
  MeasureConfig,
  Dimension,
  GroupConfig,
  FormatOptions,

  // File Import Types
  ConnectionOptions,
  FileConnectionResult,
  CSVParseOptions,
  JSONParseOptions,

  // Field Types
  FieldInfo,
  LayoutSelection,

  // Enums
  AggregationType,

  // Data Types
  Group,
} from '@mindfiredigital/pivothead-angular';
```

## Advanced Examples

### Dynamic Configuration

```typescript
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  PivotOptions,
  AggregationType,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-dynamic-pivot',
  standalone: true,
  imports: [CommonModule, FormsModule, PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="config-panel">
        <h3>Configuration</h3>

        <div>
          <label>Aggregation Type:</label>
          <select
            [(ngModel)]="selectedAggregation"
            (change)="updateAggregation()"
          >
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="count">Count</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>
        </div>

        <div>
          <label>Page Size:</label>
          <input
            type="number"
            [(ngModel)]="pageSize"
            (change)="updatePageSize()"
            min="5"
            max="100"
          />
        </div>

        <button (click)="switchViewMode()">
          {{ currentViewMode === 'raw' ? 'Show Processed' : 'Show Raw' }}
        </button>
      </div>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        [data]="salesData"
        [options]="options"
        [pagination]="paginationConfig"
        (stateChange)="onStateChange($event)"
      />
    </div>
  `,
})
export class DynamicPivotComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  selectedAggregation: AggregationType = 'sum';
  pageSize = 10;
  currentViewMode: 'raw' | 'processed' = 'processed';

  salesData = [
    { country: 'USA', category: 'Electronics', sales: 1500 },
    { country: 'Canada', category: 'Cars', sales: 1800 },
    // ... more data
  ];

  options: PivotOptions = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
    ],
  };

  paginationConfig = {
    pageSize: 10,
    currentPage: 1,
  };

  updateAggregation() {
    this.pivotTable.setMeasureAggregation('sales', this.selectedAggregation);
  }

  updatePageSize() {
    this.pivotTable.setPageSize(this.pageSize);
  }

  switchViewMode() {
    this.currentViewMode = this.currentViewMode === 'raw' ? 'processed' : 'raw';
    this.pivotTable.setViewMode(this.currentViewMode);
  }

  onStateChange(state: any) {
    console.log('State updated:', state);
  }
}
```

### Field Introspection & Dynamic Layout

```typescript
import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-field-introspection',
  standalone: true,
  imports: [CommonModule, FormsModule, PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="field-selector">
        <h3>Build Your Layout</h3>

        <div class="available-fields">
          <h4>Available Fields</h4>
          @for (field of availableFields; track field.name) {
            <div class="field-item">
              <span>{{ field.caption }} ({{ field.type }})</span>
              <button (click)="addToRows(field.name)">→ Rows</button>
              <button (click)="addToColumns(field.name)">→ Columns</button>
              <button (click)="addToMeasures(field.name)">→ Measures</button>
            </div>
          }
        </div>

        <div class="layout-config">
          <div>
            <h4>Rows</h4>
            <ul>
              @for (row of selectedRows; track row) {
                <li>{{ row }}</li>
              }
            </ul>
          </div>

          <div>
            <h4>Columns</h4>
            <ul>
              @for (col of selectedColumns; track col) {
                <li>{{ col }}</li>
              }
            </ul>
          </div>

          <div>
            <h4>Measures</h4>
            @for (measure of selectedMeasures; track measure.field) {
              <div>
                {{ measure.field }}:
                <select [(ngModel)]="measure.aggregation">
                  @for (agg of supportedAggregations; track agg) {
                    <option [value]="agg">{{ agg }}</option>
                  }
                </select>
              </div>
            }
          </div>
        </div>

        <button (click)="applyLayout()">Apply Layout</button>
      </div>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        [data]="salesData"
        (dataLoaded)="onDataLoaded()"
      />
    </div>
  `,
})
export class FieldIntrospectionComponent implements OnInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  availableFields: FieldInfo[] = [];
  supportedAggregations: string[] = [];

  selectedRows: string[] = [];
  selectedColumns: string[] = [];
  selectedMeasures: Array<{ field: string; aggregation: string }> = [];

  salesData = [
    { country: 'USA', category: 'Electronics', sales: 1500, profit: 300 },
    { country: 'Canada', category: 'Cars', sales: 1800, profit: 450 },
  ];

  ngOnInit() {
    // Give the component time to initialize
    setTimeout(() => {
      this.loadFieldInfo();
    }, 100);
  }

  onDataLoaded() {
    this.loadFieldInfo();
  }

  loadFieldInfo() {
    this.availableFields = this.pivotTable.getAvailableFields() || [];
    this.supportedAggregations =
      this.pivotTable.getSupportedAggregations() || [];
    console.log('Available fields:', this.availableFields);
    console.log('Supported aggregations:', this.supportedAggregations);
  }

  addToRows(field: string) {
    if (!this.selectedRows.includes(field)) {
      this.selectedRows.push(field);
    }
  }

  addToColumns(field: string) {
    if (!this.selectedColumns.includes(field)) {
      this.selectedColumns.push(field);
    }
  }

  addToMeasures(field: string) {
    if (!this.selectedMeasures.find(m => m.field === field)) {
      this.selectedMeasures.push({
        field,
        aggregation: this.supportedAggregations[0] || 'sum',
      });
    }
  }

  applyLayout() {
    const layout: LayoutSelection = {
      rows: this.selectedRows,
      columns: this.selectedColumns,
      measures: this.selectedMeasures.map(m => ({
        field: m.field,
        aggregation: m.aggregation as any,
      })),
    };

    this.pivotTable.buildLayout(layout);
  }
}
```

## Best Practices

### 1. Use ViewChild for Method Access

Always use ViewChild with proper typing for accessing component methods:

```typescript
@ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;
```

### 2. Handle Lifecycle Properly

Wait for `AfterViewInit` or use event callbacks before accessing component methods:

```typescript
ngAfterViewInit() {
  // Safe to call methods here
  const state = this.pivotTable.getState();
}
```

### 3. Type Your Data

Use TypeScript types for better type safety:

```typescript
interface SalesRecord {
  country: string;
  category: string;
  sales: number;
  profit: number;
}

salesData: SalesRecord[] = [
  // ...
];
```

### 4. Optimize Large Datasets

For large datasets, use Web Workers and chunked processing:

```typescript
const options: ConnectionOptions = {
  useWorkers: true,
  workerCount: 4,
  chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks
  onProgress: progress => {
    this.loadingProgress = progress;
  },
};
```

### 5. Handle Errors

Always implement error handling for file imports:

```typescript
try {
  const result = await this.pivotTable.connectToLocalCSV(options);
  if (result?.success) {
    console.log('Import successful');
  } else {
    console.error('Import failed:', result?.error);
  }
} catch (error) {
  console.error('Import error:', error);
}
```

### 6. Use Reactive Patterns

Leverage Angular's reactive patterns with RxJS:

```typescript
import { Subject, debounceTime } from 'rxjs';

private stateChange$ = new Subject<PivotTableState>();

ngOnInit() {
  this.stateChange$
    .pipe(debounceTime(300))
    .subscribe(state => {
      // Handle state changes with debounce
      console.log('State changed:', state);
    });
}

onStateChange(state: PivotTableState) {
  this.stateChange$.next(state);
}
```

## Performance Considerations

### Change Detection

The wrapper is optimized for Angular's change detection:

- Uses `OnPush` strategy where applicable
- Synchronizes only changed inputs
- Minimal re-rendering

### Memory Management

For large datasets:

```typescript
// Use pagination to limit DOM nodes
paginationConfig = {
  pageSize: 50,
  currentPage: 1
};

// Clear data when component is destroyed
ngOnDestroy() {
  this.pivotTable?.reset();
}
```

### Lazy Loading

Load data on demand:

```typescript
async loadDataOnDemand() {
  // Show loading indicator
  this.isLoading = true;

  try {
    await this.pivotTable.loadFromUrl(this.dataUrl);
  } finally {
    this.isLoading = false;
  }
}
```

## Conclusion

The PivotHead Angular Wrapper provides a robust, type-safe integration that feels native to Angular applications. With comprehensive TypeScript support, reactive data binding, and powerful file import capabilities accelerated by WebAssembly and Web Workers, it offers maximum flexibility and performance.

### Key Strengths

- **Native Angular Integration**: Feels like a natural part of Angular with proper lifecycle hooks and change detection
- **Three Flexible Modes**: Choose from default (full UI), minimal (slot-based), or none (headless)
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **File Import**: Native support for CSV, JSON with WebAssembly acceleration and Web Workers
- **Performance**: Optimized for large datasets with chunked processing and parallel workers
- **Testability**: Easy to mock and test with Angular's testing utilities

### Use Cases

The Angular wrapper excels in:

- **Enterprise Dashboards**: Building complex BI tools with custom styling
- **Data-Heavy Applications**: Processing large CSV/JSON files up to 1GB
- **Admin Panels**: Creating advanced data tables with drag & drop
- **Reporting Tools**: Generating custom reports with export capabilities
- **Performance-Critical Apps**: Leveraging WebAssembly for maximum speed
