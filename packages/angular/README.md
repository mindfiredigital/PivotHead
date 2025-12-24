<div align="center">

# PivotHead Angular

**High-Performance Pivot Tables for Angular Applications**

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/pivothead-angular?color=brightgreen)](https://www.npmjs.com/package/@mindfiredigital/pivothead-angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mindfiredigital/PivotHead/pulls)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [Support](#-support)

</div>

---

## Features

<table>
<tr>
<td width="33%" valign="top">

### **Angular-First Design**

- Native Angular component
- TypeScript definitions included
- Full AOT compatibility
- Standalone component support
- Angular 17+ compatible

</td>
<td width="33%" valign="top">

### **WebAssembly Powered**

- Process CSV files up to **1GB**
- 10x faster than pure JavaScript
- Automatic performance optimization
- Zero configuration required

</td>
<td width="33%" valign="top">

### **Flexible Rendering**

- **Default Mode**: Full UI included
- **Minimal Mode**: Slot-based customization
- **Headless Mode**: Complete control
- Custom themes support

</td>
</tr>
<tr>
<td width="33%" valign="top">

### **Rich Features**

- Drag-and-drop field management
- Dynamic aggregations
- Advanced filtering
- Multi-level grouping
- File import (CSV/JSON)
- Export to PDF/Excel/HTML

</td>
<td width="33%" valign="top">

### **Developer-Friendly**

- Simple API
- Comprehensive docs
- Full TypeScript support
- Extensive examples
- Two-way data binding

</td>
<td width="33%" valign="top">

### **Framework Agnostic Core**

- Works with Angular 17+
- Compatible with standalone components
- SSR support
- Optimized for production

</td>
</tr>
</table>

---

## Installation

```bash
# npm
npm install @mindfiredigital/pivothead-angular

# yarn
yarn add @mindfiredigital/pivothead-angular

# pnpm
pnpm add @mindfiredigital/pivothead-angular
```

### Requirements

- **Angular**: 17.0.0 or higher
- **TypeScript**: 4.5.0 or higher
- **Node.js**: 18.0.0 or higher

---

## Quick Start

### Basic Example

```typescript
import { Component } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  PivotOptions,
  PivotDataRecord,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <h1>Sales Dashboard</h1>
      <pivot-head-wrapper
        [data]="salesData"
        [options]="pivotOptions"
        [mode]="'default'"
        (stateChange)="onStateChange($event)"
      />
    </div>
  `,
})
export class DashboardComponent {
  salesData: PivotDataRecord[] = [
    { product: 'Laptop', region: 'North', sales: 5000, quarter: 'Q1' },
    { product: 'Phone', region: 'South', sales: 3000, quarter: 'Q1' },
    { product: 'Tablet', region: 'East', sales: 2000, quarter: 'Q2' },
    // ... more data
  ];

  pivotOptions: PivotOptions = {
    rows: ['product'],
    columns: ['region'],
    values: ['sales'],
  };

  onStateChange(event: any) {
    console.log('State changed:', event);
  }
}
```

### Load Large CSV Files (WebAssembly)

```typescript
import { Component, ViewChild } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-csv-uploader',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <input type="file" accept=".csv" (change)="handleFileChange($event)" />

      @if (fileData) {
        <pivot-head-wrapper
          #pivotTable
          [data]="fileData"
          [mode]="'default'"
          (dataLoaded)="onDataLoaded($event)"
          (error)="onError($event)"
        />
      }
    </div>
  `,
})
export class CsvUploaderComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  fileData: File | null = null;

  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileData = file;
      // The component automatically uses WebAssembly for optimal performance
      // - Files < 8MB: Processed in-memory with WASM
      // - Files > 8MB: Streaming + WASM hybrid mode
    }
  }

  onDataLoaded(event: any) {
    console.log('Data loaded:', event);
  }

  onError(event: any) {
    console.error('Error:', event);
  }
}
```

---

## Rendering Modes

### 1️⃣ Default Mode (Full UI)

Complete pivot table with built-in interface, drag-and-drop, filters, and controls.

```typescript
<pivot-head-wrapper
  [data]="data"
  [options]="options"
  [mode]="'default'"
/>
```

**Best for**: Quick implementation, prototyping, admin panels

---

### 2️⃣ Minimal Mode (Customizable)

Component provides structure; you control the styling and layout.

```typescript
<pivot-head-wrapper
  [data]="data"
  [options]="options"
  [mode]="'minimal'"
>
  <div slot="header">
    <!-- Your custom toolbar -->
  </div>
  <div slot="body">
    <!-- Your custom table rendering -->
  </div>
</pivot-head-wrapper>
```

**Best for**: Custom branding, unique designs, themed applications

---

### 3️⃣ Headless Mode (Complete Control)

No UI rendered - full programmatic control via API and events.

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-custom-pivot',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <pivot-head-wrapper
        #pivotTable
        [data]="data"
        [options]="options"
        [mode]="'none'"
        (stateChange)="onStateChange($event)"
      />

      @if (state) {
        <app-custom-table [data]="state.processedData" />
      }
    </div>
  `,
})
export class CustomPivotComponent implements AfterViewInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  state: any = null;
  data = [...];
  options = {...};

  ngAfterViewInit() {
    this.state = this.pivotTable.getState();
  }

  onStateChange(event: any) {
    this.state = event;
  }
}
```

**Best for**: Maximum flexibility, custom visualizations, advanced integrations

---

## Advanced Usage

### Using Component Methods

```typescript
import { Component, ViewChild } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-methods-example',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="toolbar">
        <button (click)="exportToPDF()">Export PDF</button>
        <button (click)="exportToExcel()">Export Excel</button>
        <button (click)="sortBySales()">Sort by Sales</button>
        <button (click)="refreshData()">Refresh</button>
      </div>

      <pivot-head-wrapper
        #pivotTable
        [data]="data"
        [options]="options"
        [mode]="'default'"
      />
    </div>
  `,
})
export class MethodsExampleComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  data = [...];
  options = {...};

  exportToPDF() {
    this.pivotTable.exportToPDF('sales-report');
  }

  exportToExcel() {
    this.pivotTable.exportToExcel('sales-data');
  }

  sortBySales() {
    this.pivotTable.sort('sales', 'desc');
  }

  refreshData() {
    this.pivotTable.refresh();
  }
}
```

### File Import with ConnectService

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
      <button (click)="importCSV()">Import CSV</button>
      <button (click)="importJSON()">Import JSON</button>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        (dataLoaded)="onDataLoaded($event)"
      />
    </div>
  `,
})
export class FileImportComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  async importCSV() {
    const options: ConnectionOptions = {
      csv: {
        delimiter: ',',
        hasHeader: true,
      },
      maxFileSize: 1024 * 1024 * 100, // 100MB
    };

    const result = await this.pivotTable.connectToLocalCSV(options);
    if (result?.success) {
      console.log('CSV loaded:', result.recordCount, 'records');
    }
  }

  async importJSON() {
    const result = await this.pivotTable.connectToLocalJSON();
    if (result?.success) {
      console.log('JSON loaded:', result.recordCount, 'records');
    }
  }

  onDataLoaded(event: any) {
    console.log('Data loaded:', event);
  }
}
```

### Field Introspection and Dynamic Layout

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { FieldInfo, LayoutSelection, AggregationType } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-dynamic-layout',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="field-selector">
        <h3>Available Fields</h3>
        @for (field of availableFields; track field.name) {
          <div>
            {{ field.name }} ({{ field.type }})
            <button (click)="addToRows(field.name)">Add to Rows</button>
          </div>
        }
      </div>

      <pivot-head-wrapper
        #pivotTable
        [data]="data"
        [mode]="'default'"
      />
    </div>
  `,
})
export class DynamicLayoutComponent implements AfterViewInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  availableFields: FieldInfo[] = [];
  data = [...];

  ngAfterViewInit() {
    // Get available fields from the data
    this.availableFields = this.pivotTable.getAvailableFields() || [];

    // Get supported aggregations
    const aggregations = this.pivotTable.getSupportedAggregations();
    console.log('Supported aggregations:', aggregations);
  }

  addToRows(fieldName: string) {
    // Build custom layout
    const layout: LayoutSelection = {
      rows: [fieldName],
      columns: [],
      values: [{ field: 'sales', aggregation: 'sum' as AggregationType }],
    };

    this.pivotTable.buildLayout(layout);
  }

  changeAggregation(field: string, aggregation: AggregationType) {
    this.pivotTable.setMeasureAggregation(field, aggregation);
  }
}
```

### Drag & Drop API

```typescript
import { Component, ViewChild } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <div>
      <button (click)="toggleDragDrop()">
        {{ isDragDropEnabled ? 'Disable' : 'Enable' }} Drag & Drop
      </button>
      <button (click)="swapFirstTwoRows()">Swap First Two Rows</button>

      <pivot-head-wrapper
        #pivotTable
        [data]="data"
        [options]="options"
        [mode]="'default'"
      />
    </div>
  `,
})
export class DragDropComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  isDragDropEnabled = true;
  data = [...];
  options = {...};

  toggleDragDrop() {
    this.isDragDropEnabled = !this.isDragDropEnabled;
    this.pivotTable.setDragAndDropEnabled(this.isDragDropEnabled);
  }

  swapFirstTwoRows() {
    this.pivotTable.swapRows(0, 1);
  }

  swapColumns(from: number, to: number) {
    this.pivotTable.swapColumns(from, to);
  }
}
```

### Real-Time Data Updates

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-live-dashboard',
  standalone: true,
  imports: [PivotHeadWrapperComponent],
  template: `
    <pivot-head-wrapper
      [data]="data"
      [options]="options"
      [mode]="'default'"
    />
  `,
})
export class LiveDashboardComponent implements OnInit, OnDestroy {
  data: any[] = [];
  options = {...};
  private subscription?: Subscription;

  ngOnInit() {
    // Simulate real-time data updates every 5 seconds
    this.subscription = interval(5000).subscribe(() => {
      this.fetchLatestData();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async fetchLatestData() {
    const response = await fetch('/api/sales/latest');
    this.data = await response.json();
  }
}
```

---

## Documentation

### Component Inputs

| Input        | Type                               | Default     | Description                                        |
| ------------ | ---------------------------------- | ----------- | -------------------------------------------------- |
| `mode`       | `'default' \| 'minimal' \| 'none'` | `'default'` | Rendering mode                                     |
| `data`       | `Array \| File \| string`          | `[]`        | Data source (JSON array, CSV File, or JSON string) |
| `options`    | `PivotOptions`                     | `{}`        | Pivot configuration                                |
| `filters`    | `FilterConfig[]`                   | `[]`        | Active filters                                     |
| `pagination` | `PaginationConfig`                 | `{}`        | Pagination settings                                |

### Component Outputs (Events)

| Output             | Type                                               | Description                           |
| ------------------ | -------------------------------------------------- | ------------------------------------- |
| `stateChange`      | `EventEmitter<PivotTableState<PivotDataRecord>>`   | Emitted when state changes            |
| `viewModeChange`   | `EventEmitter<{ mode: 'raw' \| 'processed' }>`     | Emitted when view mode changes        |
| `paginationChange` | `EventEmitter<PaginationConfig>`                   | Emitted when pagination changes       |
| `dataLoaded`       | `EventEmitter<{ recordCount: number; fileSize }>`  | Emitted when data is loaded from file |
| `error`            | `EventEmitter<{ message: string; code?: string }>` | Emitted when an error occurs          |

### Available Methods

Access methods via `@ViewChild`:

```typescript
@ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

// State Management
this.pivotTable.getState();
this.pivotTable.refresh();
this.pivotTable.reset();

// Data Access
this.pivotTable.getData();
this.pivotTable.getProcessedData();
this.pivotTable.getRawData();
this.pivotTable.getGroupedData();

// Configuration
this.pivotTable.setMeasures(measures);
this.pivotTable.setDimensions(dimensions);
this.pivotTable.setGroupConfig(config);
this.pivotTable.setLayout(rows, columns, measures);

// Filtering & Sorting
this.pivotTable.setFilters(filters);
this.pivotTable.getFilters();
this.pivotTable.sort(field, direction);

// Pagination
this.pivotTable.getPagination();
this.pivotTable.previousPage();
this.pivotTable.nextPage();
this.pivotTable.setPageSize(size);
this.pivotTable.goToPage(page);

// Formatting
this.pivotTable.formatValue(value, field);
this.pivotTable.updateFieldFormatting(field, format);
this.pivotTable.getFieldAlignment(field);
this.pivotTable.showFormatPopup();

// Export
this.pivotTable.exportToHTML(fileName);
this.pivotTable.exportToPDF(fileName);
this.pivotTable.exportToExcel(fileName);
this.pivotTable.openPrintDialog();

// File Import (ConnectService)
await this.pivotTable.loadFromFile(file);
await this.pivotTable.loadFromUrl(url);
await this.pivotTable.connectToLocalCSV(options);
await this.pivotTable.connectToLocalJSON(options);
await this.pivotTable.connectToLocalFile(options);

// Field Introspection
this.pivotTable.getAvailableFields();
this.pivotTable.getSupportedAggregations();
this.pivotTable.setMeasureAggregation(field, aggregation);
this.pivotTable.buildLayout(selection);

// Drag & Drop
this.pivotTable.dragRow(fromIndex, toIndex);
this.pivotTable.dragColumn(fromIndex, toIndex);
this.pivotTable.swapRows(fromIndex, toIndex);
this.pivotTable.swapColumns(fromIndex, toIndex);
this.pivotTable.setDragAndDropEnabled(enabled);
this.pivotTable.isDragAndDropEnabled();

// View Mode
this.pivotTable.setViewMode(mode);
this.pivotTable.getViewMode();
```

---

## Performance Benchmarks

| File Size | Processing Mode  | Load Time | Memory Usage  |
| --------- | ---------------- | --------- | ------------- |
| < 1 MB    | Standard         | ~50ms     | Low           |
| 1-8 MB    | Web Workers      | ~200ms    | Medium        |
| 8-100 MB  | WASM (in-memory) | ~800ms    | Medium        |
| 100MB-1GB | Streaming + WASM | ~3-5s     | Low (chunked) |

> All benchmarks run on Chrome 120, MacBook Pro M1, 16GB RAM

---

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import type {
  PivotOptions,
  PivotDataRecord,
  PivotTableState,
  FilterConfig,
  PaginationConfig,
  MeasureConfig,
  Dimension,
  GroupConfig,
  AggregationType,
  ConnectionOptions,
  FileConnectionResult,
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead-angular';
```

---

## Support

If PivotHead helps your project, please consider:

- ⭐ [Star the repository](https://github.com/mindfiredigital/PivotHead)

---

## License

MIT © [Mindfiredigital](https://github.com/mindfiredigital)

---

<div align="center">

**Built with ❤️ by the [Mindfiredigital](https://www.mindfiredigital.com) team**

[GitHub](https://github.com/mindfiredigital/PivotHead) • [NPM](https://www.npmjs.com/package/@mindfiredigital/pivothead-angular) • [Website](https://www.mindfiredigital.com)

</div>
