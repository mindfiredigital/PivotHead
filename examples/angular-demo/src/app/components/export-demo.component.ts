import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotOptions } from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

@Component({
  selector: 'app-export-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Export Features Demo</h2>
      <p>Export your pivot table data to various formats.</p>

      <div class="export-section">
        <h3>Export Options</h3>

        <div class="export-group">
          <label>File Name:</label>
          <input
            type="text"
            [(ngModel)]="fileName"
            placeholder="Enter file name..."
            class="file-name-input"
          />
        </div>

        <div class="export-buttons">
          <button (click)="exportToPDF()" class="btn btn-danger">
            <span class="icon">📄</span>
            Export to PDF
          </button>
          <button (click)="exportToExcel()" class="btn btn-success">
            <span class="icon">📊</span>
            Export to Excel
          </button>
          <button (click)="exportToHTML()" class="btn btn-info">
            <span class="icon">🌐</span>
            Export to HTML
          </button>
          <button (click)="openPrintDialog()" class="btn btn-secondary">
            <span class="icon">🖨️</span>
            Print
          </button>
        </div>
      </div>

      @if (exportLog.length > 0) {
        <div class="export-log">
          <h3>Export Log</h3>
          <div class="log-entries">
            @for (entry of exportLog; track $index) {
              <div class="log-entry">
                <span class="timestamp">{{ entry.timestamp }}</span>
                <span class="action">{{ entry.action }}</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="pivot-wrapper">
        <pivot-head-wrapper
          #pivotTable
          [data]="data"
          [options]="options"
          [mode]="'default'"
        />
      </div>

      <div class="info-box">
        <h3>💡 Export Information</h3>
        <ul>
          <li>
            <strong>PDF:</strong> Creates a formatted PDF document with your
            pivot table
          </li>
          <li>
            <strong>Excel:</strong> Exports to .xlsx format, preserving
            structure and formatting
          </li>
          <li>
            <strong>HTML:</strong> Generates standalone HTML file with embedded
            styles
          </li>
          <li>
            <strong>Print:</strong> Opens the browser print dialog for direct
            printing
          </li>
        </ul>
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

      .export-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .export-group {
        margin-bottom: 1.5rem;
      }

      .export-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #495057;
      }

      .file-name-input {
        width: 100%;
        max-width: 400px;
        padding: 0.75rem 1rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .export-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      .btn .icon {
        font-size: 1.25rem;
      }

      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .btn-success {
        background: #28a745;
        color: white;
      }

      .btn-info {
        background: #17a2b8;
        color: white;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .export-log {
        background: #fff3cd;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid #ffc107;
      }

      .export-log h3 {
        color: #856404;
      }

      .log-entries {
        max-height: 150px;
        overflow-y: auto;
      }

      .log-entry {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      .log-entry:last-child {
        margin-bottom: 0;
      }

      .timestamp {
        font-weight: 600;
        color: #856404;
        margin-right: 0.75rem;
      }

      .action {
        color: #495057;
      }

      .pivot-wrapper {
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }

      .info-box {
        background: #e7f3ff;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid #2196f3;
      }

      .info-box h3 {
        color: #1565c0;
        margin-bottom: 1rem;
      }

      .info-box ul {
        margin: 0;
        padding-left: 1.5rem;
        color: #1976d2;
      }

      .info-box li {
        margin-bottom: 0.5rem;
      }

      .info-box li:last-child {
        margin-bottom: 0;
      }
    `,
  ],
})
export class ExportDemoComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  data = salesData;
  fileName = 'pivot-table-export';
  exportLog: Array<{ timestamp: string; action: string }> = [];

  options: PivotOptions = {
    rows: ['category', 'product'],
    columns: ['region'],
    measures: [
      { uniqueName: 'sales', caption: 'Sum of Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Sum of Profit', aggregation: 'sum' },
    ],
  };

  exportToPDF() {
    this.pivotTable.exportToPDF(this.fileName);
    this.addLog('Exported to PDF: ' + this.fileName + '.pdf');
  }

  exportToExcel() {
    this.pivotTable.exportToExcel(this.fileName);
    this.addLog('Exported to Excel: ' + this.fileName + '.xlsx');
  }

  exportToHTML() {
    this.pivotTable.exportToHTML(this.fileName);
    this.addLog('Exported to HTML: ' + this.fileName + '.html');
  }

  openPrintDialog() {
    this.pivotTable.openPrintDialog();
    this.addLog('Opened print dialog');
  }

  private addLog(action: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.exportLog.unshift({ timestamp, action });
    if (this.exportLog.length > 5) {
      this.exportLog.pop();
    }
  }
}
