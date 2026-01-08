import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotOptions } from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

interface EventLog {
  timestamp: string;
  event: string;
  data: string;
  type: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'app-events-demo',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Events Demo</h2>
      <p>Monitor all events emitted by the PivotHead component.</p>

      <div class="controls">
        <button (click)="clearLogs()" class="btn btn-warning">
          Clear Logs
        </button>
        <button (click)="triggerStateChange()" class="btn btn-primary">
          Trigger State Change
        </button>
        <button (click)="toggleViewMode()" class="btn btn-info">
          Toggle View Mode
        </button>
      </div>

      <div class="event-monitor">
        <h3>Event Monitor ({{ eventLogs.length }} events)</h3>
        <div class="event-list">
          @if (eventLogs.length === 0) {
            <div class="no-events">
              No events yet. Interact with the pivot table to see events.
            </div>
          } @else {
            @for (log of eventLogs; track $index) {
              <div class="event-entry" [class]="log.type">
                <div class="event-header">
                  <span class="timestamp">{{ log.timestamp }}</span>
                  <span class="event-name">{{ log.event }}</span>
                </div>
                <div class="event-data">{{ log.data }}</div>
              </div>
            }
          }
        </div>
      </div>

      <div class="pivot-wrapper">
        <pivot-head-wrapper
          [data]="data"
          [options]="options"
          [mode]="'default'"
          (stateChange)="onStateChange($event)"
          (viewModeChange)="onViewModeChange($event)"
          (paginationChange)="onPaginationChange($event)"
          (dataLoaded)="onDataLoaded($event)"
          (error)="onError($event)"
        />
      </div>

      <div class="info-box">
        <h3>📡 Available Events</h3>
        <ul>
          <li>
            <strong>stateChange:</strong> Emitted when the pivot table state
            changes (sorting, filtering, etc.)
          </li>
          <li>
            <strong>viewModeChange:</strong> Emitted when switching between raw
            and processed view modes
          </li>
          <li>
            <strong>paginationChange:</strong> Emitted when pagination settings
            change
          </li>
          <li>
            <strong>dataLoaded:</strong> Emitted when data is loaded from a file
          </li>
          <li><strong>error:</strong> Emitted when an error occurs</li>
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

      .btn-info {
        background: #17a2b8;
        color: white;
      }

      .btn-warning {
        background: #ffc107;
        color: #000;
      }

      .event-monitor {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .event-list {
        max-height: 400px;
        overflow-y: auto;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        padding: 1rem;
      }

      .no-events {
        text-align: center;
        color: #6c757d;
        padding: 2rem;
        font-style: italic;
      }

      .event-entry {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        border-left: 4px solid;
      }

      .event-entry:last-child {
        margin-bottom: 0;
      }

      .event-entry.info {
        background: #e3f2fd;
        border-color: #2196f3;
      }

      .event-entry.success {
        background: #e8f5e9;
        border-color: #4caf50;
      }

      .event-entry.warning {
        background: #fff3e0;
        border-color: #ff9800;
      }

      .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .timestamp {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6c757d;
      }

      .event-name {
        font-weight: 600;
        font-size: 0.875rem;
        padding: 0.25rem 0.75rem;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 1rem;
      }

      .event-data {
        font-size: 0.8rem;
        font-family: monospace;
        background: rgba(0, 0, 0, 0.05);
        padding: 0.5rem;
        border-radius: 0.25rem;
        overflow-x: auto;
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
export class EventsDemoComponent {
  data = salesData;
  eventLogs: EventLog[] = [];
  currentViewMode: 'raw' | 'processed' = 'processed';

  options: PivotOptions = {
    rows: ['product'],
    columns: ['region'],
    measures: [
      { uniqueName: 'sales', caption: 'Sum of Sales', aggregation: 'sum' },
    ],
  };

  onStateChange(event: any) {
    this.addLog(
      'stateChange',
      JSON.stringify({
        rows: event.rows?.length || 0,
        columns: event.columns?.length || 0,
        measures: event.measures?.length || 0,
      }),
      'info'
    );
  }

  onViewModeChange(event: any) {
    this.currentViewMode = event.mode;
    this.addLog('viewModeChange', `Mode: ${event.mode}`, 'info');
  }

  onPaginationChange(event: any) {
    this.addLog(
      'paginationChange',
      JSON.stringify({
        currentPage: event.currentPage,
        pageSize: event.pageSize,
        totalPages: event.totalPages,
      }),
      'info'
    );
  }

  onDataLoaded(event: any) {
    this.addLog(
      'dataLoaded',
      `Records: ${event.recordCount}, Size: ${event.fileSize || 'N/A'}`,
      'success'
    );
  }

  onError(event: any) {
    this.addLog(
      'error',
      `${event.message} (Code: ${event.code || 'N/A'})`,
      'warning'
    );
  }

  clearLogs() {
    this.eventLogs = [];
  }

  triggerStateChange() {
    // This will trigger a state change event
    this.options = {
      ...this.options,
      rows: this.options.rows?.includes('category')
        ? ['product']
        : ['product', 'category'],
    };
  }

  toggleViewMode() {
    this.currentViewMode = this.currentViewMode === 'raw' ? 'processed' : 'raw';
  }

  private addLog(
    event: string,
    data: string,
    type: 'info' | 'success' | 'warning'
  ) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLogs.unshift({ timestamp, event, data, type });
    if (this.eventLogs.length > 20) {
      this.eventLogs.pop();
    }
  }
}
