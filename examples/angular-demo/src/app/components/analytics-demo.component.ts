import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PivotEngine } from '@mindfiredigital/pivothead';
import {
  ChartEngine,
  ChartRecommendation,
} from '@mindfiredigital/pivothead-analytics';
import type { ChartType } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';
import { salesData } from '../data/sample-data';

// Register Chart.js components once at module level
Chart.register(...registerables);

interface ChartTypeOption {
  value: ChartType;
  label: string;
}

const CHART_TYPE_OPTIONS: ChartTypeOption[] = [
  { value: 'column', label: 'Column' },
  { value: 'bar', label: 'Bar (Horizontal)' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'pie', label: 'Pie' },
  { value: 'doughnut', label: 'Doughnut' },
  { value: 'stackedColumn', label: 'Stacked Column' },
  { value: 'stackedBar', label: 'Stacked Bar' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'heatmap', label: 'Heatmap' },
];

const MEASURES = [
  { value: 'sales', label: 'Sales ($)' },
  { value: 'profit', label: 'Profit ($)' },
  { value: 'quantity', label: 'Quantity (units)' },
];

@Component({
  selector: 'app-analytics-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <h2>Analytics & Data Visualization</h2>
      <p>
        Interactive charts powered by
        <strong>&#64;mindfiredigital/pivothead-analytics</strong> using
        Chart.js. Switch chart type, measure, or row grouping to see the data
        update in real time.
      </p>

      <!-- Controls toolbar -->
      <div class="toolbar">
        <div class="control-group">
          <label>Chart Type</label>
          <select
            [(ngModel)]="selectedChartType"
            (ngModelChange)="onChartTypeChange($event)"
            class="select"
          >
            <option *ngFor="let t of chartTypeOptions" [value]="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Measure</label>
          <select
            [(ngModel)]="selectedMeasure"
            (ngModelChange)="onMeasureChange($event)"
            class="select"
          >
            <option *ngFor="let m of measures" [value]="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Group Rows By</label>
          <select
            [(ngModel)]="selectedRowField"
            (ngModelChange)="onRowFieldChange($event)"
            class="select"
          >
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="region">Region</option>
            <option value="quarter">Quarter</option>
          </select>
        </div>

        <div class="control-group btn-group">
          <button
            (click)="exportPng()"
            class="btn btn-primary"
            [disabled]="exporting"
          >
            {{ exporting ? 'Exporting…' : 'Export PNG' }}
          </button>
          <button (click)="exportCsv()" class="btn btn-secondary">
            Export CSV
          </button>
        </div>
      </div>

      <div class="analytics-layout">
        <!-- Main chart panel -->
        <div class="chart-panel">
          <div class="chart-header">
            <span class="chart-title">{{ chartTitle }}</span>
            <span class="chart-badge">{{ selectedChartType }}</span>
          </div>
          <div class="chart-wrapper">
            <div *ngIf="!chartReady" class="chart-placeholder">
              Initializing chart…
            </div>
            <div
              #chartContainer
              [id]="chartContainerId"
              class="chart-container"
              [style.display]="chartReady ? 'block' : 'none'"
            ></div>
          </div>
        </div>

        <!-- Recommendations sidebar -->
        <div class="recommendations-panel">
          <h3>Smart Recommendations</h3>
          <p class="rec-subtitle">
            Based on your pivot structure, these chart types are recommended:
          </p>

          <div
            *ngFor="let rec of recommendations; let i = index"
            class="rec-card"
            [class.rec-active]="rec.type === selectedChartType"
            (click)="applyRecommendation(rec)"
            title="Click to apply"
          >
            <div class="rec-rank">#{{ i + 1 }}</div>
            <div class="rec-content">
              <div class="rec-type">{{ rec.type }}</div>
              <div class="rec-score">
                <span
                  class="score-bar"
                  [style.width.%]="rec.score * 100"
                ></span>
                <span class="score-label"
                  >{{ (rec.score * 100).toFixed(0) }}%</span
                >
              </div>
              <div class="rec-reason">{{ rec.reason }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary stats -->
      <div class="stats-row" *ngIf="stats">
        <div class="stat-card" *ngFor="let stat of stats">
          <div class="stat-value">{{ stat.value | number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
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

      /* ── Toolbar ── */
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
        padding: 1rem 1.25rem;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .control-group label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #495057;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: white;
        cursor: pointer;
        min-width: 160px;
      }

      .select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
      }

      .btn-group {
        flex-direction: row;
        gap: 0.5rem;
        align-items: flex-end;
      }

      .btn {
        padding: 0.5rem 1.125rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      /* ── Layout ── */
      .analytics-layout {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 900px) {
        .analytics-layout {
          grid-template-columns: 1fr;
        }
      }

      /* ── Chart Panel ── */
      .chart-panel {
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
        background: white;
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.875rem 1.25rem;
        border-bottom: 1px solid #dee2e6;
        background: #f8f9fa;
      }

      .chart-title {
        font-weight: 600;
        font-size: 0.9rem;
        color: #343a40;
      }

      .chart-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        background: #667eea;
        color: white;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .chart-wrapper {
        padding: 1.25rem;
        min-height: 380px;
        position: relative;
      }

      .chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 360px;
        color: #adb5bd;
        font-size: 0.9rem;
      }

      .chart-container {
        width: 100%;
        height: 360px;
      }

      /* ── Recommendations ── */
      .recommendations-panel {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        padding: 1.25rem;
      }

      .recommendations-panel h3 {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        color: #343a40;
      }

      .rec-subtitle {
        font-size: 0.775rem;
        color: #868e96;
        margin-bottom: 1rem;
      }

      .rec-card {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        margin-bottom: 0.6rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .rec-card:hover {
        border-color: #667eea;
        background: #f8f7ff;
      }

      .rec-card.rec-active {
        border-color: #667eea;
        background: #eef0ff;
      }

      .rec-rank {
        font-size: 0.7rem;
        font-weight: 700;
        color: #adb5bd;
        padding-top: 2px;
        min-width: 20px;
      }

      .rec-content {
        flex: 1;
        min-width: 0;
      }

      .rec-type {
        font-size: 0.825rem;
        font-weight: 600;
        color: #495057;
        text-transform: capitalize;
        margin-bottom: 0.3rem;
      }

      .rec-score {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.3rem;
      }

      .score-bar {
        display: inline-block;
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        flex-shrink: 0;
      }

      .score-label {
        font-size: 0.7rem;
        color: #868e96;
        white-space: nowrap;
      }

      .rec-reason {
        font-size: 0.75rem;
        color: #868e96;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Stats row ── */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        margin-top: 0.5rem;
      }

      .stat-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
        text-align: center;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #868e96;
        margin-top: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    `,
  ],
})
export class AnalyticsDemoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  // Stable DOM id so ChartEngine's getContainerId() returns the same key on every call.
  // Without this, the element's .id is '' which causes the fallback random-id path,
  // making destroyChart() unable to find the previous chart and the canvas stays locked.
  readonly chartContainerId = `ph-analytics-chart-${Math.random().toString(36).slice(2)}`;

  chartTypeOptions = CHART_TYPE_OPTIONS;
  measures = MEASURES;

  selectedChartType: ChartType = 'column';
  selectedMeasure = 'sales';
  selectedRowField = 'product';

  chartReady = false;
  exporting = false;
  recommendations: ChartRecommendation[] = [];

  stats: { value: number; label: string }[] | null = null;

  get chartTitle(): string {
    const measure =
      this.measures.find(m => m.value === this.selectedMeasure)?.label ||
      this.selectedMeasure;
    return `${measure} by ${this.selectedRowField} & Quarter`;
  }

  private pivotEngine!: PivotEngine<Record<string, unknown>>;
  private chartEngine!: ChartEngine<Record<string, unknown>>;

  ngAfterViewInit(): void {
    // Defer to next tick so the container element is stable in the DOM
    setTimeout(() => this.initChartEngine(), 0);
  }

  ngOnDestroy(): void {
    this.chartEngine?.dispose();
  }

  private initChartEngine(): void {
    this.pivotEngine = new PivotEngine({
      data: salesData,
      rawData: salesData as unknown as Record<string, unknown>[],
      rows: [{ uniqueName: this.selectedRowField, caption: 'Row' }],
      columns: [{ uniqueName: 'quarter', caption: 'Quarter' }],
      measures: [
        { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' },
        { uniqueName: 'profit', caption: 'Profit', aggregation: 'sum' },
        { uniqueName: 'quantity', caption: 'Quantity', aggregation: 'sum' },
      ],
      dimensions: [],
      defaultAggregation: 'sum',
    } as any);

    this.chartEngine = new ChartEngine(this.pivotEngine as any, {
      chartInstance: Chart,
      defaultStyle: { colorScheme: 'tableau10', animated: true },
    });

    this.recommendations = this.chartEngine.recommend().slice(0, 5);
    this.refreshStats();
    this.renderChart();
  }

  private rebuildPivotEngine(): void {
    this.chartEngine?.dispose();
    this.chartReady = false;

    this.pivotEngine = new PivotEngine({
      data: salesData,
      rawData: salesData as unknown as Record<string, unknown>[],
      rows: [{ uniqueName: this.selectedRowField, caption: 'Row' }],
      columns: [{ uniqueName: 'quarter', caption: 'Quarter' }],
      measures: [
        { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' },
        { uniqueName: 'profit', caption: 'Profit', aggregation: 'sum' },
        { uniqueName: 'quantity', caption: 'Quantity', aggregation: 'sum' },
      ],
      dimensions: [],
      defaultAggregation: 'sum',
    } as any);

    this.chartEngine = new ChartEngine(this.pivotEngine as any, {
      chartInstance: Chart,
      defaultStyle: { colorScheme: 'tableau10', animated: true },
    });

    this.recommendations = this.chartEngine.recommend().slice(0, 5);
    this.refreshStats();
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.chartContainer?.nativeElement) return;

    // Apply measure filter via ChartService
    const cs = this.chartEngine.getChartService();
    cs.setFilters({ selectedMeasure: this.selectedMeasure });

    // Destroy any existing chart on this container
    this.chartEngine.destroyChart(this.chartContainer.nativeElement);

    this.chartEngine.render({
      container: this.chartContainer.nativeElement,
      type: this.selectedChartType,
      style: {
        title: this.chartTitle,
        showLegend: true,
        legendPosition: 'top',
        animated: true,
      },
    });

    this.chartReady = true;
  }

  private refreshStats(): void {
    const data = salesData;
    const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
    const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
    const totalQty = data.reduce((sum, d) => sum + d.quantity, 0);
    const products = new Set(data.map(d => d.product)).size;

    this.stats = [
      { value: totalSales, label: 'Total Sales ($)' },
      { value: totalProfit, label: 'Total Profit ($)' },
      { value: totalQty, label: 'Units Sold' },
      { value: products, label: 'Products' },
    ];
  }

  onChartTypeChange(type: ChartType): void {
    this.selectedChartType = type;
    this.renderChart();
  }

  onMeasureChange(measure: string): void {
    this.selectedMeasure = measure;
    this.renderChart();
  }

  onRowFieldChange(field: string): void {
    this.selectedRowField = field;
    this.rebuildPivotEngine();
  }

  applyRecommendation(rec: ChartRecommendation): void {
    this.selectedChartType = rec.type;
    this.renderChart();
  }

  async exportPng(): Promise<void> {
    if (!this.chartContainer?.nativeElement) return;
    this.exporting = true;
    try {
      await this.chartEngine.exportAsPng(
        this.chartContainer.nativeElement,
        `analytics-${this.selectedChartType}-${this.selectedMeasure}`
      );
    } finally {
      this.exporting = false;
    }
  }

  async exportCsv(): Promise<void> {
    if (!this.chartContainer?.nativeElement) return;
    await this.chartEngine.exportAsCsv(
      this.chartContainer.nativeElement,
      `analytics-data-${this.selectedMeasure}`
    );
  }
}
