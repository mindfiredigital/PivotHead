import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  PivotOptions,
  PivotTableState,
  PivotDataRecord,
} from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

@Component({
  selector: 'app-basic-demo',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Basic Pivot Table Demo</h2>
      <p>
        This demonstrates the basic usage of PivotHead with sample sales data.
      </p>

      <div class="controls">
        <button (click)="refreshTable()" class="btn btn-primary">
          Refresh
        </button>
        <button (click)="resetTable()" class="btn btn-secondary">Reset</button>
        <button (click)="sortBySales()" class="btn btn-info">
          Sort by Sales (Desc)
        </button>
        <button (click)="toggleViewMode()" class="btn btn-warning">
          Switch to
          {{ currentViewMode === 'processed' ? 'Raw' : 'Processed' }} View
        </button>
      </div>

      <div class="pivot-wrapper">
        <pivot-head-wrapper
          #pivotTable
          [data]="data"
          [options]="options"
          [mode]="'default'"
          (stateChange)="onStateChange($event)"
        />
      </div>

      <div class="state-info">
        <h3>Current State</h3>
        <pre>{{ stateInfo }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 1400px;
      }

      h2 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
        margin-bottom: 1.5rem;
      }

      .controls {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.625rem 1.25rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-info {
        background: #17a2b8;
        color: white;
      }

      .btn-warning {
        background: #ffc107;
        color: #000;
      }

      .pivot-wrapper {
        margin-bottom: 2rem;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .state-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.375rem;
        margin-top: 1.5rem;
      }

      .state-info h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        color: #495057;
      }

      .state-info pre {
        margin: 0;
        padding: 1rem;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        overflow-x: auto;
        max-height: 300px;
        overflow-y: auto;
      }
    `,
  ],
})
export class BasicDemoComponent implements AfterViewInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  data = salesData;
  currentViewMode: 'raw' | 'processed' = 'processed';
  stateInfo = 'Loading...';

  options: PivotOptions = {
    rows: ['product', 'region'],
    columns: ['quarter'],
    measures: [
      { uniqueName: 'sales', caption: 'Sum of Sales', aggregation: 'sum' },
      {
        uniqueName: 'quantity',
        caption: 'Sum of Quantity',
        aggregation: 'sum',
      },
      { uniqueName: 'profit', caption: 'Sum of Profit', aggregation: 'sum' },
    ],
  };

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateStateInfo();
    }, 100);
  }

  refreshTable() {
    this.pivotTable.refresh();
    console.log('Table refreshed');
  }

  resetTable() {
    this.pivotTable.reset();
    console.log('Table reset');
  }

  sortBySales() {
    this.pivotTable.sort('sales', 'desc');
    console.log('Sorted by sales (descending)');
  }

  toggleViewMode() {
    this.currentViewMode = this.currentViewMode === 'raw' ? 'processed' : 'raw';
    this.pivotTable.setViewMode(this.currentViewMode);
    console.log('View mode:', this.currentViewMode);
  }

  onStateChange(event: any) {
    console.log('State changed:', event);
    this.updateStateInfo();
  }

  private updateStateInfo() {
    const state = this.pivotTable.getState();
    if (state) {
      this.stateInfo = JSON.stringify(
        {
          rows: state.rows?.length || 0,
          columns: state.columns?.length || 0,
          measures: state.measures?.length || 0,
          dataCount: state.rawData?.length || 0,
          viewMode: this.pivotTable.getViewMode(),
        },
        null,
        2
      );
    }
  }
}
