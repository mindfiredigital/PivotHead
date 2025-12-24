---
id: angular-api-reference
title: Angular API Reference
sidebar_label: Angular
---

# Angular API Reference

Complete API documentation for `@mindfiredigital/pivothead-angular`.

## Installation

```bash
npm install @mindfiredigital/pivothead-angular
```

## Component

### PivotHeadWrapperComponent

The main Angular wrapper component for PivotHead.

```typescript
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
```

## Inputs

### data

- **Type**: `PivotDataRecord[]`
- **Default**: `undefined`
- **Description**: Array of data objects to process in the pivot table

```typescript
salesData: PivotDataRecord[] = [
  { country: 'USA', category: 'Electronics', sales: 1500 },
  { country: 'Canada', category: 'Cars', sales: 1800 },
];
```

```html
<pivot-head-wrapper [data]="salesData" />
```

### options

- **Type**: `PivotOptions`
- **Default**: `undefined`
- **Description**: Pivot configuration including rows, columns, and measures

```typescript
options: PivotOptions = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
  ],
};
```

```html
<pivot-head-wrapper [data]="salesData" [options]="options" />
```

**PivotOptions Interface:**

```typescript
interface PivotOptions {
  rows?: Dimension[];
  columns?: Dimension[];
  measures?: MeasureConfig[];
}

interface Dimension {
  uniqueName: string;
  caption: string;
}

interface MeasureConfig {
  uniqueName: string;
  caption: string;
  aggregation: AggregationType;
  format?: FormatOptions;
}

type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';
```

### filters

- **Type**: `FilterConfig[]`
- **Default**: `undefined`
- **Description**: Array of filter configurations to apply to the data

```typescript
filters: FilterConfig[] = [
  {
    field: 'country',
    operator: 'equals',
    value: 'USA'
  }
];
```

```html
<pivot-head-wrapper [data]="salesData" [filters]="filters" />
```

### pagination

- **Type**: `PaginationConfig`
- **Default**: `undefined`
- **Description**: Pagination settings for the pivot table

```typescript
paginationConfig: PaginationConfig = {
  pageSize: 10,
  currentPage: 1,
};
```

```html
<pivot-head-wrapper [data]="salesData" [pagination]="paginationConfig" />
```

**PaginationConfig Interface:**

```typescript
interface PaginationConfig {
  pageSize: number;
  currentPage: number;
}
```

### mode

- **Type**: `'default' | 'minimal' | 'none'`
- **Default**: `'default'`
- **Description**: Rendering mode for the pivot table

```html
<!-- Default mode: Full UI -->
<pivot-head-wrapper [mode]="'default'" [data]="salesData" />

<!-- Minimal mode: Slot-based custom UI -->
<pivot-head-wrapper [mode]="'minimal'" [data]="salesData">
  <div slot="header">Custom Header</div>
  <div slot="body">Custom Body</div>
</pivot-head-wrapper>

<!-- None mode: Headless, no UI -->
<pivot-head-wrapper [mode]="'none'" [data]="salesData" />
```

## Outputs

### stateChange

- **Type**: `EventEmitter<PivotTableState>`
- **Description**: Emitted when the pivot table state changes (data, configuration, view mode, etc.)

```typescript
onStateChange(event: PivotTableState) {
  console.log('State changed:', event);
  console.log('Data:', event.data);
  console.log('View mode:', event.viewMode);
}
```

```html
<pivot-head-wrapper [data]="salesData" (stateChange)="onStateChange($event)" />
```

**PivotTableState Interface:**

```typescript
interface PivotTableState<T = PivotDataRecord> {
  data: T[];
  viewMode: 'raw' | 'processed';
  filters?: FilterConfig[];
  pagination?: PaginationConfig;
  options?: PivotOptions;
}
```

### viewModeChange

- **Type**: `EventEmitter<{ mode: 'raw' | 'processed' }>`
- **Description**: Emitted when the view mode switches between raw and processed data

```typescript
onViewModeChange(event: { mode: 'raw' | 'processed' }) {
  console.log('View mode changed to:', event.mode);
}
```

```html
<pivot-head-wrapper
  [data]="salesData"
  (viewModeChange)="onViewModeChange($event)"
/>
```

### paginationChange

- **Type**: `EventEmitter<PaginationConfig>`
- **Description**: Emitted when pagination settings change

```typescript
onPaginationChange(event: PaginationConfig) {
  console.log('Page:', event.currentPage);
  console.log('Page size:', event.pageSize);
}
```

```html
<pivot-head-wrapper
  [data]="salesData"
  (paginationChange)="onPaginationChange($event)"
/>
```

### dataLoaded

- **Type**: `EventEmitter<{ recordCount: number, fileSize?: number }>`
- **Description**: Emitted when data is successfully loaded (via file import or URL)

```typescript
onDataLoaded(event: { recordCount: number, fileSize?: number }) {
  console.log('Loaded', event.recordCount, 'records');
  if (event.fileSize) {
    console.log('File size:', event.fileSize, 'bytes');
  }
}
```

```html
<pivot-head-wrapper (dataLoaded)="onDataLoaded($event)" />
```

### error

- **Type**: `EventEmitter<{ message: string, code?: string }>`
- **Description**: Emitted when an error occurs during data loading or processing

```typescript
onError(event: { message: string, code?: string }) {
  console.error('Error:', event.message);
  if (event.code) {
    console.error('Error code:', event.code);
  }
}
```

```html
<pivot-head-wrapper (error)="onError($event)" />
```

## Public Methods

Access these methods via ViewChild reference:

```typescript
@ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;
```

### State Management

#### getState()

Get the current pivot table state.

```typescript
getState(): PivotTableState | undefined
```

**Example:**

```typescript
const state = this.pivotTable.getState();
console.log('Current state:', state);
```

#### refresh()

Refresh the pivot table, re-processing the current data.

```typescript
refresh(): void
```

**Example:**

```typescript
this.pivotTable.refresh();
```

#### reset()

Reset the pivot table to its initial state.

```typescript
reset(): void
```

**Example:**

```typescript
this.pivotTable.reset();
```

### Data Operations

#### getData()

Get the raw input data.

```typescript
getData(): PivotDataRecord[] | undefined
```

**Example:**

```typescript
const data = this.pivotTable.getData();
console.log('Raw data:', data);
```

#### getProcessedData()

Get the processed pivot data.

```typescript
getProcessedData(): unknown | undefined
```

**Example:**

```typescript
const processed = this.pivotTable.getProcessedData();
console.log('Processed data:', processed);
```

#### getRawData()

Alias for getData() - get the raw input data.

```typescript
getRawData(): PivotDataRecord[] | undefined
```

**Example:**

```typescript
const rawData = this.pivotTable.getRawData();
```

### Sorting & Filtering

#### sort()

Sort data by a specific field.

```typescript
sort(field: string, direction: 'asc' | 'desc'): void
```

**Parameters:**

- `field`: The field name to sort by
- `direction`: Sort direction ('asc' or 'desc')

**Example:**

```typescript
this.pivotTable.sort('sales', 'desc');
```

#### getFilters()

Get current filter configurations.

```typescript
getFilters(): FilterConfig[] | undefined
```

**Example:**

```typescript
const filters = this.pivotTable.getFilters();
console.log('Active filters:', filters);
```

### Configuration

#### setMeasures()

Update the measures configuration.

```typescript
setMeasures(measures: MeasureConfig[]): void
```

**Example:**

```typescript
this.pivotTable.setMeasures([
  { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
  { uniqueName: 'profit', caption: 'Total Profit', aggregation: 'sum' },
]);
```

#### setDimensions()

Update the dimensions (rows and columns).

```typescript
setDimensions(dimensions: Dimension[]): void
```

**Example:**

```typescript
this.pivotTable.setDimensions([
  { uniqueName: 'country', caption: 'Country' },
  { uniqueName: 'category', caption: 'Category' },
]);
```

#### setGroupConfig()

Set or clear group configuration.

```typescript
setGroupConfig(config: GroupConfig | null): void
```

**Example:**

```typescript
this.pivotTable.setGroupConfig({
  field: 'category',
  order: 'asc',
});

// Clear grouping
this.pivotTable.setGroupConfig(null);
```

### Pagination

#### getPagination()

Get current pagination configuration.

```typescript
getPagination(): PaginationConfig | undefined
```

**Example:**

```typescript
const pagination = this.pivotTable.getPagination();
console.log('Current page:', pagination?.currentPage);
```

#### setPageSize()

Set the number of items per page.

```typescript
setPageSize(size: number): void
```

**Example:**

```typescript
this.pivotTable.setPageSize(25);
```

#### goToPage()

Navigate to a specific page.

```typescript
goToPage(page: number): void
```

**Example:**

```typescript
this.pivotTable.goToPage(3);
```

#### previousPage()

Navigate to the previous page.

```typescript
previousPage(): void
```

**Example:**

```typescript
this.pivotTable.previousPage();
```

#### nextPage()

Navigate to the next page.

```typescript
nextPage(): void
```

**Example:**

```typescript
this.pivotTable.nextPage();
```

### View Control

#### setViewMode()

Switch between raw and processed data view.

```typescript
setViewMode(mode: 'raw' | 'processed'): void
```

**Example:**

```typescript
this.pivotTable.setViewMode('raw');
```

#### getViewMode()

Get the current view mode.

```typescript
getViewMode(): 'raw' | 'processed' | undefined
```

**Example:**

```typescript
const mode = this.pivotTable.getViewMode();
console.log('Current view mode:', mode);
```

### Formatting

#### formatValue()

Format a value for display based on field configuration.

```typescript
formatValue(value: unknown, field: string): string | undefined
```

**Example:**

```typescript
const formatted = this.pivotTable.formatValue(1234.56, 'sales');
console.log(formatted); // "$1,234.56"
```

#### updateFieldFormatting()

Update formatting options for a specific field.

```typescript
updateFieldFormatting(field: string, format: FormatOptions): void
```

**FormatOptions Interface:**

```typescript
interface FormatOptions {
  type?: 'number' | 'currency' | 'percentage' | 'date';
  decimals?: number;
  currencySymbol?: string;
  thousandsSeparator?: boolean;
  dateFormat?: string;
}
```

**Example:**

```typescript
this.pivotTable.updateFieldFormatting('sales', {
  type: 'currency',
  decimals: 2,
  currencySymbol: '$',
  thousandsSeparator: true,
});
```

#### getFieldAlignment()

Get the alignment setting for a field.

```typescript
getFieldAlignment(field: string): string | undefined
```

**Example:**

```typescript
const alignment = this.pivotTable.getFieldAlignment('sales');
console.log(alignment); // 'right'
```

#### showFormatPopup()

Show the formatting configuration popup (default mode only).

```typescript
showFormatPopup(): void
```

**Example:**

```typescript
this.pivotTable.showFormatPopup();
```

### Export

#### exportToHTML()

Export the pivot table to HTML format.

```typescript
exportToHTML(fileName?: string): void
```

**Example:**

```typescript
this.pivotTable.exportToHTML('sales-report');
```

#### exportToPDF()

Export the pivot table to PDF format.

```typescript
exportToPDF(fileName?: string): void
```

**Example:**

```typescript
this.pivotTable.exportToPDF('sales-report');
```

#### exportToExcel()

Export the pivot table to Excel format.

```typescript
exportToExcel(fileName?: string): void
```

**Example:**

```typescript
this.pivotTable.exportToExcel('sales-report');
```

#### openPrintDialog()

Open the browser print dialog for the pivot table.

```typescript
openPrintDialog(): void
```

**Example:**

```typescript
this.pivotTable.openPrintDialog();
```

### Drag & Drop

#### swapRows()

Swap two rows by index.

```typescript
swapRows(from: number, to: number): void
```

**Example:**

```typescript
this.pivotTable.swapRows(0, 2);
```

#### swapColumns()

Swap two columns by index.

```typescript
swapColumns(from: number, to: number): void
```

**Example:**

```typescript
this.pivotTable.swapColumns(1, 3);
```

#### dragRow()

Programmatically drag a row from one position to another.

```typescript
dragRow(fromIndex: number, toIndex: number): void
```

**Example:**

```typescript
this.pivotTable.dragRow(0, 3);
```

#### dragColumn()

Programmatically drag a column from one position to another.

```typescript
dragColumn(fromIndex: number, toIndex: number): void
```

**Example:**

```typescript
this.pivotTable.dragColumn(1, 2);
```

#### setDragAndDropEnabled()

Enable or disable drag and drop functionality.

```typescript
setDragAndDropEnabled(enabled: boolean): void
```

**Example:**

```typescript
this.pivotTable.setDragAndDropEnabled(true);
```

#### isDragAndDropEnabled()

Check if drag and drop is currently enabled.

```typescript
isDragAndDropEnabled(): boolean | undefined
```

**Example:**

```typescript
const isEnabled = this.pivotTable.isDragAndDropEnabled();
console.log('Drag & drop enabled:', isEnabled);
```

### File Import

#### loadFromFile()

Load data from a File object.

```typescript
loadFromFile(file: File): Promise<void>
```

**Example:**

```typescript
async handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    await this.pivotTable.loadFromFile(file);
  }
}
```

#### loadFromUrl()

Load data from a remote URL.

```typescript
loadFromUrl(url: string): Promise<void>
```

**Example:**

```typescript
await this.pivotTable.loadFromUrl('https://example.com/data/sales.csv');
```

#### connectToLocalCSV()

Open file dialog and import a CSV file with full configuration options.

```typescript
connectToLocalCSV(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
```

**Example:**

```typescript
const result = await this.pivotTable.connectToLocalCSV({
  csv: {
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true,
    trimValues: true,
  },
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  useWorkers: true,
  workerCount: 4,
  chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks
});

console.log('Import result:', result);
```

#### connectToLocalJSON()

Open file dialog and import a JSON file.

```typescript
connectToLocalJSON(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
```

**Example:**

```typescript
const result = await this.pivotTable.connectToLocalJSON({
  json: {
    validateSchema: true,
  },
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  useWorkers: true,
  workerCount: 4,
});
```

#### connectToLocalFile()

Open file dialog and import any supported file type (CSV or JSON).

```typescript
connectToLocalFile(options?: ConnectionOptions): Promise<FileConnectionResult | undefined>
```

**Example:**

```typescript
const result = await this.pivotTable.connectToLocalFile({
  csv: {
    delimiter: ',',
    hasHeader: true,
  },
  json: {
    validateSchema: true,
  },
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  useWorkers: true,
  workerCount: 4,
  chunkSizeBytes: 1024 * 1024 * 10,
  onProgress: progress => {
    console.log(`Import progress: ${progress}%`);
  },
});
```

**ConnectionOptions Interface:**

```typescript
interface ConnectionOptions {
  // CSV-specific options
  csv?: CSVParseOptions;

  // JSON-specific options
  json?: JSONParseOptions;

  // General options
  maxFileSize?: number;
  maxRecords?: number;
  onProgress?: (progress: number) => void;

  // Performance options
  useWorkers?: boolean;
  workerCount?: number;
  chunkSizeBytes?: number;
}

interface CSVParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  encoding?: string;
}

interface JSONParseOptions {
  validateSchema?: boolean;
}
```

**FileConnectionResult Interface:**

```typescript
interface FileConnectionResult {
  success: boolean;
  recordCount?: number;
  fileSize?: number;
  fileName?: string;
  parseTime?: number;
  performanceMode?: 'wasm' | 'workers' | 'sync';
  error?: string;
}
```

### Field Introspection

#### getAvailableFields()

Get information about all available fields in the dataset.

```typescript
getAvailableFields(): FieldInfo[] | undefined
```

**Example:**

```typescript
const fields = this.pivotTable.getAvailableFields();
console.log('Available fields:', fields);
```

**FieldInfo Interface:**

```typescript
interface FieldInfo {
  name: string;
  caption: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}
```

#### getSupportedAggregations()

Get list of supported aggregation types.

```typescript
getSupportedAggregations(): AggregationType[] | undefined
```

**Example:**

```typescript
const aggregations = this.pivotTable.getSupportedAggregations();
console.log('Supported aggregations:', aggregations);
// ['sum', 'avg', 'count', 'min', 'max']
```

#### setMeasureAggregation()

Change the aggregation type for a specific measure.

```typescript
setMeasureAggregation(field: string, aggregation: AggregationType): void
```

**Example:**

```typescript
this.pivotTable.setMeasureAggregation('sales', 'avg');
```

#### buildLayout()

Build a pivot layout from a field selection.

```typescript
buildLayout(selection: LayoutSelection): void
```

**LayoutSelection Interface:**

```typescript
interface LayoutSelection {
  rows: string[];
  columns: string[];
  measures: Array<{
    field: string;
    aggregation: AggregationType;
  }>;
}
```

**Example:**

```typescript
this.pivotTable.buildLayout({
  rows: ['country', 'region'],
  columns: ['category'],
  measures: [
    { field: 'sales', aggregation: 'sum' },
    { field: 'profit', aggregation: 'avg' },
  ],
});
```

### Grouping

#### getGroupedData()

Get data grouped according to the current configuration.

```typescript
getGroupedData(): Group[] | undefined
```

**Example:**

```typescript
const grouped = this.pivotTable.getGroupedData();
console.log('Grouped data:', grouped);
```

## Type Exports

All TypeScript types are exported from the package:

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

## Complete Example

```typescript
import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  PivotOptions,
  PivotDataRecord,
  PivotTableState,
  ConnectionOptions,
  FileConnectionResult,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-complete-example',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div>
      <div class="controls">
        <button (click)="importCSV()">Import CSV</button>
        <button (click)="exportExcel()">Export Excel</button>
        <button (click)="refresh()">Refresh</button>
        <button (click)="reset()">Reset</button>
      </div>

      <pivot-head-wrapper
        #pivotTable
        [mode]="'default'"
        [data]="salesData"
        [options]="options"
        [pagination]="paginationConfig"
        (stateChange)="onStateChange($event)"
        (dataLoaded)="onDataLoaded($event)"
        (error)="onError($event)"
      />

      @if (importResult) {
        <div class="result">
          <h3>Last Import</h3>
          <p>Records: {{ importResult.recordCount?.toLocaleString() }}</p>
          <p>Performance: {{ importResult.performanceMode }}</p>
          <p>Time: {{ importResult.parseTime }}ms</p>
        </div>
      }
    </div>
  `,
})
export class CompleteExampleComponent implements OnInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  salesData: PivotDataRecord[] = [
    { country: 'USA', category: 'Electronics', sales: 1500, profit: 300 },
    { country: 'Canada', category: 'Cars', sales: 1800, profit: 450 },
    { country: 'Australia', category: 'Accessories', sales: 1200, profit: 240 },
  ];

  options: PivotOptions = {
    rows: [{ uniqueName: 'country', caption: 'Country' }],
    columns: [{ uniqueName: 'category', caption: 'Category' }],
    measures: [
      { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Total Profit', aggregation: 'sum' },
    ],
  };

  paginationConfig = {
    pageSize: 10,
    currentPage: 1,
  };

  importResult: FileConnectionResult | null = null;

  ngOnInit() {
    console.log('Component initialized');
  }

  async importCSV() {
    const options: ConnectionOptions = {
      csv: {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      useWorkers: true,
      workerCount: 4,
      chunkSizeBytes: 1024 * 1024 * 10,
    };

    try {
      const result = await this.pivotTable.connectToLocalCSV(options);
      this.importResult = result || null;
    } catch (error: any) {
      console.error('Import error:', error);
    }
  }

  exportExcel() {
    this.pivotTable.exportToExcel('sales-report');
  }

  refresh() {
    this.pivotTable.refresh();
  }

  reset() {
    this.pivotTable.reset();
  }

  onStateChange(state: PivotTableState) {
    console.log('State changed:', state);
  }

  onDataLoaded(event: { recordCount: number; fileSize?: number }) {
    console.log('Data loaded:', event.recordCount, 'records');
  }

  onError(event: { message: string; code?: string }) {
    console.error('Error:', event.message);
  }
}
```

## See Also

- [Angular Conceptual Reference](../conceptual-reference/angular.md) - Detailed concepts and usage patterns
- [Web Component API Reference](./core-webcomponent.md) - Underlying web component API
- [Core Engine Reference](../../Installation.md) - Core PivotHead engine documentation
