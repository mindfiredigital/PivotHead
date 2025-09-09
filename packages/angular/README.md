# PivotHead Angular Wrapper

Angular wrapper for the PivotHead web component, providing seamless integration with Angular applications.

## Features

- Full Angular integration with all three modes: `default`, `minimal`, and `none`
- Type-safe TypeScript interfaces
- Event handling through Angular outputs
- Template support for minimal mode slots
- Complete API access to the underlying web component

## Installation

```bash
npm install @mindfiredigital/pivothead-angular
```

## Usage

### Basic Usage (Default Mode)

```typescript
import { Component } from '@angular/core';
import { PivotDataRecord } from '@mindfiredigital/pivothead-angular';

@Component({
  template: `
    <pivot-head
      [data]="pivotData"
      [options]="pivotOptions"
      (stateChange)="onStateChange($event)"
      (paginationChange)="onPaginationChange($event)"
    >
    </pivot-head>
  `,
})
export class MyComponent {
  pivotData: PivotDataRecord[] = [
    { region: 'North', product: 'Widget', sales: 100 },
    { region: 'South', product: 'Gadget', sales: 200 },
    // ... more data
  ];

  pivotOptions = {
    rows: ['region'],
    columns: ['product'],
    measures: ['sales'],
  };

  onStateChange(state: any) {
    console.log('Pivot state changed:', state);
  }

  onPaginationChange(pagination: any) {
    console.log('Pagination changed:', pagination);
  }
}
```

### Minimal Mode with Templates

```typescript
@Component({
  template: `
    <pivot-head
      mode="minimal"
      [data]="pivotData"
      [options]="pivotOptions"
      [headerTemplate]="headerTemplate"
      [bodyTemplate]="bodyTemplate"
    >
    </pivot-head>

    <ng-template #headerTemplate>
      <div class="custom-toolbar">
        <button (click)="refresh()">Refresh</button>
        <!-- Custom toolbar content -->
      </div>
    </ng-template>

    <ng-template #bodyTemplate>
      <div class="custom-table">
        <!-- Custom table rendering -->
      </div>
    </ng-template>
  `,
})
export class MinimalModeComponent {
  // Component implementation
}
```

### Alternative: Using the Directive

You can also use the directive approach for more direct control:

```typescript
import { ViewChild } from '@angular/core';
import { PivotHeadDirective } from '@mindfiredigital/pivothead-angular';

@Component({
  template: `
    <pivot-head
      #pivotRef="pivotHeadDirective"
      pivotHeadDirective
      [data]="pivotData"
      [options]="pivotOptions"
      (stateChange)="onStateChange($event)"
    >
    </pivot-head>
  `,
})
export class DirectiveExampleComponent {
  @ViewChild('pivotRef') pivotRef!: PivotHeadDirective;

  export() {
    this.pivotRef.methods.exportToExcel('data.xlsx');
  }
}
```

### None Mode with Full Control

````

```typescript
import { ViewChild } from '@angular/core';
import { PivotHeadComponent } from '@mindfiredigital/pivothead-angular';

@Component({
  template: `
    <pivot-head
      #pivotRef
      mode="none"
      [data]="pivotData"
      [options]="pivotOptions"
      [filters]="filters"
      (stateChange)="onStateChange($event)">
    </pivot-head>

    <!-- Custom UI built on top -->
    <div class="custom-controls">
      <button (click)="export()">Export</button>
      <button (click)="toggleView()">Toggle View</button>
    </div>
  `
})
export class NoneModeComponent {
  @ViewChild('pivotRef') pivotRef!: PivotHeadComponent;

  export() {
    this.pivotRef.methods.exportToExcel('data.xlsx');
  }

  toggleView() {
    const currentMode = this.pivotRef.methods.getViewMode();
    const newMode = currentMode === 'raw' ? 'processed' : 'raw';
    this.pivotRef.methods.setViewMode(newMode);
  }
}
````

## Module Setup

```typescript
import { NgModule } from '@angular/core';
import { PivotHeadModule } from '@mindfiredigital/pivothead-angular';

@NgModule({
  imports: [PivotHeadModule],
  // ...
})
export class AppModule {}
```

## Service Usage

The package includes a `PivotHeadService` for utility functions:

```typescript
import { Component } from '@angular/core';
import { PivotHeadService } from '@mindfiredigital/pivothead-angular';

@Component({
  // ...
})
export class MyComponent {
  constructor(private pivotService: PivotHeadService) {}

  processData() {
    // Validate data
    if (!this.pivotService.validateData(this.rawData)) {
      console.error('Invalid data format');
      return;
    }

    // Get field names
    const fields = this.pivotService.getFieldNames(this.rawData);

    // Calculate aggregates
    const total = this.pivotService.calculateAggregates(
      this.rawData,
      'sales',
      'sum'
    );

    // Filter data
    const filtered = this.pivotService.filterData(
      this.rawData,
      'region',
      'equals',
      'North'
    );

    // Export to CSV
    this.pivotService.exportToCsv(filtered, 'filtered-data.csv');
  }
}
```

## API Reference

### Inputs

| Property         | Type                               | Description                           |
| ---------------- | ---------------------------------- | ------------------------------------- |
| `mode`           | `'default' \| 'minimal' \| 'none'` | Display mode of the pivot table       |
| `data`           | `PivotDataRecord[]`                | Data array for the pivot table        |
| `options`        | `PivotOptions`                     | Configuration options                 |
| `filters`        | `FilterConfig[]`                   | Active filters                        |
| `pagination`     | `Partial<PaginationConfig>`        | Pagination settings                   |
| `headerTemplate` | `TemplateRef`                      | Custom header template (minimal mode) |
| `bodyTemplate`   | `TemplateRef`                      | Custom body template (minimal mode)   |

### Outputs

| Event              | Type                             | Description                      |
| ------------------ | -------------------------------- | -------------------------------- |
| `stateChange`      | `EventEmitter<PivotTableState>`  | Emitted when pivot state changes |
| `viewModeChange`   | `EventEmitter<{mode: string}>`   | Emitted when view mode changes   |
| `paginationChange` | `EventEmitter<PaginationConfig>` | Emitted when pagination changes  |

### Methods

Access methods through the component reference:

```typescript
@ViewChild('pivotRef') pivotRef!: PivotHeadComponent;

// Access all web component methods
this.pivotRef.methods.refresh();
this.pivotRef.methods.exportToExcel('filename.xlsx');
this.pivotRef.methods.setViewMode('processed');
// ... and many more
```

## License

MIT
