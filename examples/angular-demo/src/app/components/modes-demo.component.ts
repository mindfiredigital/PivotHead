import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';
import type { PivotOptions } from '@mindfiredigital/pivothead-angular';
import { salesData } from '../data/sample-data';

@Component({
  selector: 'app-modes-demo',
  standalone: true,
  imports: [CommonModule, PivotHeadWrapperComponent],
  template: `
    <div class="demo-container">
      <h2>Rendering Modes Demo</h2>
      <p>
        PivotHead supports three different rendering modes for maximum
        flexibility.
      </p>

      <div class="mode-selector">
        <button
          (click)="selectedMode = 'default'"
          [class.active]="selectedMode === 'default'"
          class="mode-btn"
        >
          Default Mode
        </button>
        <button
          (click)="selectedMode = 'minimal'"
          [class.active]="selectedMode === 'minimal'"
          class="mode-btn"
        >
          Minimal Mode
        </button>
        <button
          (click)="selectedMode = 'none'"
          [class.active]="selectedMode === 'none'"
          class="mode-btn"
        >
          Headless Mode
        </button>
      </div>

      @if (selectedMode === 'default') {
        <div class="mode-section">
          <div class="mode-info">
            <h3>🎨 Default Mode</h3>
            <p>
              Full UI with built-in controls, drag-and-drop, filters, and
              pagination.
            </p>
            <ul>
              <li>Complete user interface included</li>
              <li>Drag-and-drop field management</li>
              <li>Built-in filtering and sorting</li>
              <li>Pagination controls</li>
              <li>Export buttons</li>
            </ul>
          </div>
          <div class="pivot-wrapper">
            <pivot-head-wrapper
              [data]="data"
              [options]="options"
              [mode]="'default'"
            />
          </div>
        </div>
      }

      @if (selectedMode === 'minimal') {
        <div class="mode-section">
          <div class="mode-info">
            <h3>✨ Minimal Mode</h3>
            <p>
              Custom slots for header and body, allowing you to create your own
              UI.
            </p>
            <ul>
              <li>Slot-based customization</li>
              <li>Custom header and body templates</li>
              <li>Full control over styling</li>
              <li>Maintains core functionality</li>
            </ul>
          </div>
          <div class="pivot-wrapper minimal">
            <pivot-head-wrapper
              [data]="data"
              [options]="options"
              [mode]="'minimal'"
            >
              <div slot="header" class="custom-header">
                <h4>Custom Header Slot</h4>
                <p>
                  This is a custom header area where you can add your own
                  controls and branding.
                </p>
                <div class="custom-controls">
                  <button class="custom-btn">Custom Action 1</button>
                  <button class="custom-btn">Custom Action 2</button>
                </div>
              </div>
              <div slot="body" class="custom-body">
                <p>
                  Custom body content goes here. You can render the table
                  however you want!
                </p>
              </div>
            </pivot-head-wrapper>
          </div>
        </div>
      }

      @if (selectedMode === 'none') {
        <div class="mode-section">
          <div class="mode-info">
            <h3>🚀 Headless Mode</h3>
            <p>
              No UI rendered - complete programmatic control via API and events.
            </p>
            <ul>
              <li>Zero UI footprint</li>
              <li>Full API access</li>
              <li>Event-driven architecture</li>
              <li>Build completely custom visualizations</li>
              <li>Maximum flexibility</li>
            </ul>
          </div>
          <div class="headless-demo">
            <pivot-head-wrapper
              #headlessTable
              [data]="data"
              [options]="options"
              [mode]="'none'"
              (stateChange)="onHeadlessStateChange($event)"
            />

            <div class="custom-visualization">
              <h4>Custom Visualization</h4>
              <p>
                This is a completely custom UI built using the headless mode.
              </p>

              @if (headlessState) {
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-value">
                      {{ headlessState.rawData?.length || 0 }}
                    </div>
                    <div class="stat-label">Total Records</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">
                      {{ headlessState.rows?.length || 0 }}
                    </div>
                    <div class="stat-label">Row Fields</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">
                      {{ headlessState.columns?.length || 0 }}
                    </div>
                    <div class="stat-label">Column Fields</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">
                      {{ headlessState.measures?.length || 0 }}
                    </div>
                    <div class="stat-label">Measures</div>
                  </div>
                </div>

                <div class="data-preview">
                  <h5>State Data Preview:</h5>
                  <pre>{{ headlessState | json }}</pre>
                </div>
              } @else {
                <p class="loading">Loading state...</p>
              }
            </div>
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

      .mode-selector {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.5rem;
      }

      .mode-btn {
        flex: 1;
        padding: 1rem 1.5rem;
        border: 2px solid #dee2e6;
        background: white;
        border-radius: 0.375rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mode-btn:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .mode-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
      }

      .mode-section {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mode-info {
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        padding: 2rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        border-left: 4px solid #667eea;
      }

      .mode-info h3 {
        margin: 0 0 1rem 0;
        color: #667eea;
        font-size: 1.5rem;
      }

      .mode-info p {
        color: #495057;
        margin-bottom: 1rem;
      }

      .mode-info ul {
        margin: 0;
        padding-left: 1.5rem;
        color: #495057;
      }

      .mode-info li {
        margin-bottom: 0.5rem;
      }

      .pivot-wrapper {
        border: 2px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .pivot-wrapper.minimal {
        background: #f8f9fa;
      }

      .custom-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
      }

      .custom-header h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
      }

      .custom-header p {
        margin: 0 0 1rem 0;
        opacity: 0.9;
        color: white;
      }

      .custom-controls {
        display: flex;
        gap: 0.75rem;
      }

      .custom-btn {
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .custom-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .custom-body {
        padding: 2rem;
        text-align: center;
        color: #6c757d;
        font-style: italic;
      }

      .headless-demo {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 0.5rem;
      }

      .custom-visualization {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        border: 2px dashed #dee2e6;
      }

      .custom-visualization h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .custom-visualization > p {
        margin: 0 0 2rem 0;
        color: #6c757d;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        padding: 2rem;
        border-radius: 0.5rem;
        text-align: center;
        border: 2px solid #667eea30;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6c757d;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .data-preview {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.375rem;
        border: 1px solid #dee2e6;
      }

      .data-preview h5 {
        margin: 0 0 1rem 0;
        color: #495057;
        font-size: 0.9rem;
      }

      .data-preview pre {
        margin: 0;
        padding: 1rem;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        max-height: 300px;
        overflow: auto;
      }

      .loading {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 2rem;
      }
    `,
  ],
})
export class ModesDemoComponent {
  data = salesData;
  selectedMode: 'default' | 'minimal' | 'none' = 'default';
  headlessState: any = null;

  options: PivotOptions = {
    rows: ['product'],
    columns: ['region'],
    measures: [
      { uniqueName: 'sales', caption: 'Sum of Sales', aggregation: 'sum' },
      { uniqueName: 'profit', caption: 'Sum of Profit', aggregation: 'sum' },
    ],
  };

  onHeadlessStateChange(event: any) {
    this.headlessState = event;
    console.log('Headless state:', event);
  }
}
