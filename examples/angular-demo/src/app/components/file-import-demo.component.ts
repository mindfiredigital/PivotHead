import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type {
  ConnectionOptions,
  FileConnectionResult,
} from '@mindfiredigital/pivothead-angular';

@Component({
  selector: 'app-file-import-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>File Import Demo</h2>
      <p>
        Import CSV or JSON files and process them with WebAssembly for optimal
        performance.
      </p>

      <div class="import-section">
        <h3>Import Methods</h3>

        <div class="method-group">
          <h4>1. File Input Upload</h4>
          <input
            type="file"
            accept=".csv,.json"
            (change)="handleFileUpload($event)"
            class="file-input"
          />
          @if (uploadedFile) {
            <p class="file-info">
              Selected: {{ uploadedFile.name }} ({{
                formatFileSize(uploadedFile.size)
              }})
            </p>
          }
        </div>

        <div class="method-group">
          <h4>2. ConnectService Methods</h4>
          <div class="btn-group">
            <button (click)="connectToCSV()" class="btn btn-primary">
              Import CSV
            </button>
            <button (click)="connectToJSON()" class="btn btn-primary">
              Import JSON
            </button>
            <button (click)="connectToAnyFile()" class="btn btn-primary">
              Import Any File
            </button>
          </div>
        </div>

        <div class="method-group">
          <h4>3. Load from URL</h4>
          <div class="url-input-group">
            <input
              type="text"
              [(ngModel)]="fileUrl"
              placeholder="Enter file URL..."
              class="url-input"
            />
            <button
              (click)="loadFromUrl()"
              class="btn btn-success"
              [disabled]="!fileUrl"
            >
              Load URL
            </button>
          </div>
        </div>
      </div>

      @if (importResult) {
        <div
          class="result-section"
          [class.success]="importResult.success"
          [class.error]="!importResult.success"
        >
          <h3>Import Result</h3>
          <div class="result-grid">
            <div class="result-item">
              <span class="label">Status:</span>
              <span class="value">{{
                importResult.success ? 'Success' : 'Failed'
              }}</span>
            </div>
            @if (importResult.fileName) {
              <div class="result-item">
                <span class="label">File:</span>
                <span class="value">{{ importResult.fileName }}</span>
              </div>
            }
            @if (importResult.fileSize) {
              <div class="result-item">
                <span class="label">Size:</span>
                <span class="value">{{
                  formatFileSize(importResult.fileSize)
                }}</span>
              </div>
            }
            @if (importResult.recordCount) {
              <div class="result-item">
                <span class="label">Records:</span>
                <span class="value">{{
                  importResult.recordCount.toLocaleString()
                }}</span>
              </div>
            }
            @if (importResult.performanceMode) {
              <div class="result-item">
                <span class="label">Mode:</span>
                <span class="value">{{ importResult.performanceMode }}</span>
              </div>
            }
            @if (importResult.parseTime) {
              <div class="result-item">
                <span class="label">Parse Time:</span>
                <span class="value">{{ importResult.parseTime }}ms</span>
              </div>
            }
            @if (importResult.error) {
              <div class="result-item error-message">
                <span class="label">Error:</span>
                <span class="value">{{ importResult.error }}</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="pivot-wrapper">
        <pivot-head-wrapper
          #pivotTable
          [mode]="'default'"
          (dataLoaded)="onDataLoaded($event)"
          (error)="onError($event)"
        />
      </div>

      @if (logs.length > 0) {
        <div class="logs-section">
          <h3>Event Logs</h3>
          <div class="logs">
            @for (log of logs; track $index) {
              <div class="log-entry" [class]="log.type">
                <span class="timestamp">{{ log.timestamp }}</span>
                <span class="message">{{ log.message }}</span>
              </div>
            }
          </div>
        </div>
      }
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

      .import-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .import-section h3 {
        margin: 0 0 1.5rem 0;
        color: #495057;
      }

      .method-group {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #dee2e6;
      }

      .method-group:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .method-group h4 {
        margin: 0 0 1rem 0;
        color: #6c757d;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .file-input {
        padding: 0.5rem;
        border: 2px dashed #dee2e6;
        border-radius: 0.375rem;
        width: 100%;
        cursor: pointer;
      }

      .file-info {
        margin: 0.5rem 0 0 0;
        color: #28a745;
        font-size: 0.875rem;
      }

      .btn-group {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .url-input-group {
        display: flex;
        gap: 0.75rem;
      }

      .url-input {
        flex: 1;
        padding: 0.625rem 1rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        font-size: 0.875rem;
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

      .btn-success {
        background: #28a745;
        color: white;
      }

      .result-section {
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .result-section.success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
      }

      .result-section.error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
      }

      .result-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #495057;
      }

      .result-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .result-item {
        display: flex;
        justify-content: space-between;
      }

      .result-item .label {
        font-weight: 600;
        color: #495057;
      }

      .result-item .value {
        color: #212529;
      }

      .error-message {
        grid-column: 1 / -1;
        color: #721c24;
      }

      .pivot-wrapper {
        margin-bottom: 2rem;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .logs-section {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.375rem;
      }

      .logs-section h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        color: #495057;
      }

      .logs {
        max-height: 200px;
        overflow-y: auto;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        padding: 0.75rem;
      }

      .log-entry {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
      }

      .log-entry:last-child {
        margin-bottom: 0;
      }

      .log-entry.info {
        background: #d1ecf1;
        color: #0c5460;
      }

      .log-entry.success {
        background: #d4edda;
        color: #155724;
      }

      .log-entry.error {
        background: #f8d7da;
        color: #721c24;
      }

      .log-entry .timestamp {
        font-weight: 600;
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class FileImportDemoComponent {
  @ViewChild('pivotTable') pivotTable!: PivotHeadWrapperComponent;

  uploadedFile: File | null = null;
  fileUrl = '';
  importResult: FileConnectionResult | null = null;
  logs: Array<{ timestamp: string; message: string; type: string }> = [];

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.uploadedFile = file;
      this.addLog('File selected: ' + file.name, 'info');

      try {
        await this.pivotTable.loadFromFile(file);
        this.addLog('File loaded successfully', 'success');
      } catch (error: any) {
        this.addLog('Error loading file: ' + error.message, 'error');
      }
    }
  }

  async connectToCSV() {
    const options: ConnectionOptions = {
      csv: {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1024MB (1GB) - WebAssembly is automatically used when available
      useWorkers: true,
      workerCount: 4, // Use 4 workers for parallel processing
      chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks for streaming
    };

    this.addLog('Opening CSV import dialog...', 'info');

    try {
      const result = await this.pivotTable.connectToLocalCSV(options);
      this.importResult = result || null;

      if (result?.success) {
        this.addLog(`CSV imported: ${result.recordCount} records`, 'success');
      } else {
        this.addLog('CSV import failed', 'error');
      }
    } catch (error: any) {
      this.addLog('Error: ' + error.message, 'error');
    }
  }

  async connectToJSON() {
    const options: ConnectionOptions = {
      json: {
        validateSchema: true,
      },
      maxFileSize: 1024 * 1024 * 1024, // 1024MB (1GB)
      useWorkers: true,
      workerCount: 4,
    };

    this.addLog('Opening JSON import dialog...', 'info');

    try {
      const result = await this.pivotTable.connectToLocalJSON(options);
      this.importResult = result || null;

      if (result?.success) {
        this.addLog(`JSON imported: ${result.recordCount} records`, 'success');
      } else {
        this.addLog('JSON import failed', 'error');
      }
    } catch (error: any) {
      this.addLog('Error: ' + error.message, 'error');
    }
  }

  async connectToAnyFile() {
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
      maxFileSize: 1024 * 1024 * 1024, // 1024MB (1GB) - WebAssembly is automatically used when available
      useWorkers: true,
      workerCount: 4,
      chunkSizeBytes: 1024 * 1024 * 10, // 10MB chunks for streaming
    };

    this.addLog('Opening file import dialog...', 'info');

    try {
      const result = await this.pivotTable.connectToLocalFile(options);
      this.importResult = result || null;

      if (result?.success) {
        this.addLog(`File imported: ${result.recordCount} records`, 'success');
      } else {
        this.addLog('File import failed', 'error');
      }
    } catch (error: any) {
      this.addLog('Error: ' + error.message, 'error');
    }
  }

  async loadFromUrl() {
    if (!this.fileUrl) return;

    this.addLog('Loading from URL: ' + this.fileUrl, 'info');

    try {
      await this.pivotTable.loadFromUrl(this.fileUrl);
      this.addLog('URL loaded successfully', 'success');
    } catch (error: any) {
      this.addLog('Error loading URL: ' + error.message, 'error');
    }
  }

  onDataLoaded(event: any) {
    this.addLog(`Data loaded: ${event.recordCount} records`, 'success');
  }

  onError(event: any) {
    this.addLog('Error: ' + event.message, 'error');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  private addLog(message: string, type: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, message, type });
    if (this.logs.length > 10) {
      this.logs.pop();
    }
  }
}
