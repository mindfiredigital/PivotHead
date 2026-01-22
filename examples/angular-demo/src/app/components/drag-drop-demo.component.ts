import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotOptions } from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

@Component({
  selector: 'app-drag-drop-demo',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Drag & Drop API Demo</h2>
      <p>Programmatically control drag and drop functionality.</p>

      <div class="controls">
        <button
          (click)="toggleDragDrop()"
          [class.active]="isDragDropEnabled"
          class="btn btn-primary"
        >
          {{
            isDragDropEnabled
              ? '✓ Drag & Drop Enabled'
              : '✗ Drag & Drop Disabled'
          }}
        </button>
        <button
          (click)="swapFirstTwoRows()"
          class="btn btn-info"
          [disabled]="!isDragDropEnabled"
        >
          Swap First Two Rows
        </button>
        <button
          (click)="swapFirstTwoColumns()"
          class="btn btn-success"
          [disabled]="!isDragDropEnabled"
        >
          Swap First Two Columns
        </button>
        <button
          (click)="randomSwap()"
          class="btn btn-warning"
          [disabled]="!isDragDropEnabled"
        >
          Random Swap
        </button>
      </div>

      <div class="info-box">
        <h3>Current State</h3>
        <p>
          <strong>Drag & Drop:</strong>
          {{ isDragDropEnabled ? 'Enabled' : 'Disabled' }}
        </p>
        <p class="tip">
          💡 Tip: When enabled, you can also manually drag rows and columns in
          the table!
        </p>
      </div>

      <div class="pivot-wrapper">
        <pivot-head-wrapper
          #pivotTable
          [data]="data"
          [options]="options"
          [mode]="'default'"
        />
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

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary.active {
        background: #28a745;
      }

      .btn-info {
        background: #17a2b8;
        color: white;
      }

      .btn-success {
        background: #28a745;
        color: white;
      }

      .btn-warning {
        background: #ffc107;
        color: #000;
      }

      .info-box {
        background: #e3f2fd;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid #2196f3;
      }

      .info-box h3 {
        margin: 0 0 1rem 0;
        color: #1565c0;
        font-size: 1rem;
      }

      .info-box p {
        margin: 0.5rem 0;
        color: #1976d2;
      }

      .info-box .tip {
        font-style: italic;
        margin-top: 1rem;
      }

      .pivot-wrapper {
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
      }
    `,
  ],
})
export class DragDropDemoComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  data = salesData;
  isDragDropEnabled = true;

  options: PivotOptions = {
    rows: ['product', 'region'],
    columns: ['quarter', 'year'],
    measures: [
      { uniqueName: 'sales', caption: 'Sum of Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Sum of Profit', aggregation: 'sum' },
    ],
  };

  toggleDragDrop() {
    this.isDragDropEnabled = !this.isDragDropEnabled;
    this.pivotTable.setDragAndDropEnabled(this.isDragDropEnabled);
    console.log(
      'Drag & Drop:',
      this.isDragDropEnabled ? 'Enabled' : 'Disabled'
    );
  }

  swapFirstTwoRows() {
    this.pivotTable.swapRows(0, 1);
    console.log('Swapped rows 0 and 1');
  }

  swapFirstTwoColumns() {
    this.pivotTable.swapColumns(0, 1);
    console.log('Swapped columns 0 and 1');
  }

  randomSwap() {
    const isRow = Math.random() > 0.5;
    const from = Math.floor(Math.random() * 3);
    const to = Math.floor(Math.random() * 3);

    if (isRow) {
      this.pivotTable.swapRows(from, to);
      console.log(`Swapped rows ${from} and ${to}`);
    } else {
      this.pivotTable.swapColumns(from, to);
      console.log(`Swapped columns ${from} and ${to}`);
    }
  }
}
// end of DragDropDemoComponent
