import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  FieldInfo,
  AggregationType,
  LayoutSelection,
} from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

@Component({
  selector: 'app-field-introspection-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Field Introspection Demo</h2>
      <p>Dynamically discover fields and build custom layouts.</p>

      <div class="controls-section">
        <div class="field-discovery">
          <h3>Available Fields</h3>
          <button (click)="discoverFields()" class="btn btn-primary">
            Discover Fields
          </button>

          @if (availableFields.length > 0) {
            <div class="fields-grid">
              @for (field of availableFields; track field.name) {
                <div class="field-card">
                  <div class="field-header">
                    <span class="field-name">{{ field.name }}</span>
                    <span class="field-type" [class]="field.type">{{
                      field.type
                    }}</span>
                  </div>
                  <div class="field-actions">
                    <button
                      (click)="addToRows(field.name)"
                      class="btn-sm btn-info"
                    >
                      + Row
                    </button>
                    <button
                      (click)="addToColumns(field.name)"
                      class="btn-sm btn-success"
                    >
                      + Column
                    </button>
                    @if (field.type === 'number') {
                      <button
                        (click)="addToValues(field.name)"
                        class="btn-sm btn-warning"
                      >
                        + Value
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="aggregation-section">
          <h3>Supported Aggregations</h3>
          @if (supportedAggregations.length > 0) {
            <div class="aggregations">
              @for (agg of supportedAggregations; track agg) {
                <span class="agg-badge">{{ agg }}</span>
              }
            </div>
          }
        </div>

        <div class="layout-builder">
          <h3>Layout Builder</h3>
          <div class="layout-form">
            <div class="form-group">
              <label>Rows:</label>
              <div class="chip-container">
                @for (row of selectedRows; track $index; let i = $index) {
                  <div class="chip">
                    {{ row }}
                    <button (click)="removeRow(i)" class="chip-remove">
                      ×
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Columns:</label>
              <div class="chip-container">
                @for (col of selectedColumns; track $index; let i = $index) {
                  <div class="chip">
                    {{ col }}
                    <button (click)="removeColumn(i)" class="chip-remove">
                      ×
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Values:</label>
              <div class="value-items">
                @for (val of selectedValues; track $index; let i = $index) {
                  <div class="value-item">
                    <span>{{ val.field }}</span>
                    <select [(ngModel)]="val.aggregation" class="agg-select">
                      @for (agg of supportedAggregations; track agg) {
                        <option [value]="agg">{{ agg }}</option>
                      }
                    </select>
                    <button (click)="removeValue(i)" class="btn-sm btn-danger">
                      ×
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="form-actions">
              <button
                (click)="applyLayout()"
                class="btn btn-primary"
                [disabled]="!canApplyLayout()"
              >
                Apply Layout
              </button>
              <button (click)="clearLayout()" class="btn btn-secondary">
                Clear Layout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="pivot-wrapper">
        <pivot-head-wrapper #pivotTable [data]="data" [mode]="'default'" />
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 1400px;
      }

      h2,
      h3 {
        color: #333;
      }

      h2 {
        margin-bottom: 0.5rem;
      }

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }

      p {
        color: #666;
        margin-bottom: 1.5rem;
      }

      .controls-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .field-discovery,
      .aggregation-section,
      .layout-builder {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #dee2e6;
      }

      .layout-builder {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .fields-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .field-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        padding: 1rem;
      }

      .field-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .field-name {
        font-weight: 600;
        color: #495057;
      }

      .field-type {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .field-type.string {
        background: #e3f2fd;
        color: #1976d2;
      }

      .field-type.number {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .field-type.date {
        background: #fff3e0;
        color: #f57c00;
      }

      .field-actions {
        display: flex;
        gap: 0.5rem;
      }

      .aggregations {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .agg-badge {
        padding: 0.5rem 1rem;
        background: #667eea;
        color: white;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .layout-form {
        background: white;
        padding: 1.5rem;
        border-radius: 0.375rem;
        border: 1px solid #dee2e6;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #495057;
      }

      .chip-container {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        min-height: 40px;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 0.25rem;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        background: #667eea;
        color: white;
        border-radius: 1rem;
        font-size: 0.875rem;
      }

      .chip-remove {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
      }

      .value-items {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .value-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 0.25rem;
      }

      .value-item span {
        flex: 1;
        font-weight: 500;
      }

      .agg-select {
        padding: 0.375rem 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
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

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-sm {
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
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

      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .pivot-wrapper {
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
      }
    `,
  ],
})
export class FieldIntrospectionDemoComponent implements AfterViewInit {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  data = salesData;
  availableFields: FieldInfo[] = [];
  supportedAggregations: AggregationType[] = [];

  selectedRows: string[] = [];
  selectedColumns: string[] = [];
  selectedValues: Array<{ field: string; aggregation: AggregationType }> = [];

  ngAfterViewInit() {
    setTimeout(() => {
      this.discoverFields();
    }, 100);
  }

  discoverFields() {
    this.availableFields = this.pivotTable.getAvailableFields() || [];
    this.supportedAggregations =
      this.pivotTable.getSupportedAggregations() || [];
    console.log('Available fields:', this.availableFields);
    console.log('Supported aggregations:', this.supportedAggregations);
  }

  addToRows(fieldName: string) {
    if (!this.selectedRows.includes(fieldName)) {
      this.selectedRows.push(fieldName);
    }
  }

  addToColumns(fieldName: string) {
    if (!this.selectedColumns.includes(fieldName)) {
      this.selectedColumns.push(fieldName);
    }
  }

  addToValues(fieldName: string) {
    if (!this.selectedValues.find(v => v.field === fieldName)) {
      this.selectedValues.push({
        field: fieldName,
        aggregation: 'sum',
      });
    }
  }

  removeRow(index: number) {
    this.selectedRows.splice(index, 1);
  }

  removeColumn(index: number) {
    this.selectedColumns.splice(index, 1);
  }

  removeValue(index: number) {
    this.selectedValues.splice(index, 1);
  }

  canApplyLayout(): boolean {
    return this.selectedValues.length > 0;
  }

  applyLayout() {
    const layout: LayoutSelection = {
      rows: this.selectedRows,
      columns: this.selectedColumns,
      values: this.selectedValues,
    };

    this.pivotTable.buildLayout(layout);
    console.log('Layout applied:', layout);
  }

  clearLayout() {
    this.selectedRows = [];
    this.selectedColumns = [];
    this.selectedValues = [];
  }
}
