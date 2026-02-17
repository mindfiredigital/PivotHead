---
id: analytics-api-reference
title: Analytics API Reference
sidebar_label: Analytics
description: Complete API reference for PivotHead Analytics - data visualization and charting for pivot tables
keywords:
  [api, analytics, charts, visualization, pivothead, echarts, plotly, d3]
---

# Analytics API Reference

Complete API reference for `@mindfiredigital/pivothead-analytics`.

---

## Installation

```bash
npm install @mindfiredigital/pivothead-analytics
```

No additional charting library installation is required — everything is bundled and ready to use out of the box.

---

## ChartEngine

The primary way to create charts from your pivot data. Handles rendering, recommendations, exporting, and lifecycle management.

### Constructor

```typescript
import { ChartEngine } from '@mindfiredigital/pivothead-analytics';
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine(data, config);
const chartEngine = new ChartEngine(engine, {
  library: 'chartjs', // 'chartjs' | 'echarts' | 'plotly' | 'd3'
  defaultStyle: {
    colorScheme: 'tableau10',
    animated: true,
  },
});
```

#### Options

| Option          | Type                                         | Default     | Description                           |
| --------------- | -------------------------------------------- | ----------- | ------------------------------------- |
| `library`       | `'chartjs' \| 'echarts' \| 'plotly' \| 'd3'` | `'chartjs'` | Rendering library to use              |
| `defaultStyle`  | `StyleConfig`                                | —           | Default styling for all charts        |
| `defaultFormat` | `FormatConfig`                               | —           | Default value formatting              |
| `performance`   | `PerformanceConfig`                          | —           | Performance tuning for large datasets |

---

### Rendering Methods

#### `render(config)`

Renders a chart with full configuration control.

```typescript
const chart = chartEngine.render({
  container: '#my-chart',
  type: 'column',
  style: {
    title: 'Revenue by Region',
    showLegend: true,
    legendPosition: 'bottom',
    showGrid: true,
    animated: true,
  },
  format: {
    valueFormat: 'currency',
    currency: 'USD',
  },
  interactions: {
    hover: true,
    click: data => console.log('Clicked:', data),
  },
});
```

#### `auto(config)`

Automatically detects the best chart type for your data and renders it.

```typescript
const chart = chartEngine.auto({
  container: '#my-chart',
  style: { title: 'Sales Overview' },
});
```

#### Convenience Methods

One-liner methods for each chart type:

```typescript
chartEngine.column({ container: '#chart' });
chartEngine.bar({ container: '#chart' });
chartEngine.line({ container: '#chart' });
chartEngine.area({ container: '#chart' });
chartEngine.pie({ container: '#chart' });
chartEngine.doughnut({ container: '#chart' });
chartEngine.stackedColumn({ container: '#chart' });
chartEngine.stackedBar({ container: '#chart' });
chartEngine.scatter({ container: '#chart' });
chartEngine.heatmap({ container: '#chart' });
chartEngine.histogram({ container: '#chart' });
chartEngine.funnel({ container: '#chart' });
chartEngine.combo({ container: '#chart' });
```

---

### Smart Recommendations

The engine analyzes your pivot table structure and data to recommend the best chart types.

#### `recommend()`

Returns all chart recommendations sorted by confidence score.

```typescript
const recommendations = chartEngine.recommend();

recommendations.forEach(rec => {
  console.log(`${rec.type}: ${rec.score * 100}% — ${rec.reason}`);
});
// Example output:
// "line: 96% — Time dimension detected - line chart shows trends over time"
// "area: 90% — Area chart emphasizes volume changes over time"
// "column: 85% — Column chart effectively compares 12 categories"
```

#### `getBestRecommendation()`

Returns the single highest-scored recommendation.

```typescript
const best = chartEngine.getBestRecommendation();
console.log(best.type); // e.g., 'line'
console.log(best.reason); // e.g., 'Time dimension detected...'
```

#### `renderRecommendation(recommendation, container, overrides?)`

Renders a chart directly from a recommendation object.

```typescript
const recommendations = chartEngine.recommend();
const chart = chartEngine.renderRecommendation(
  recommendations[0],
  '#my-chart',
  { style: { animated: true } } // optional overrides
);
```

#### `ChartRecommendation` Object

Each recommendation includes:

| Field     | Type        | Description                                          |
| --------- | ----------- | ---------------------------------------------------- |
| `type`    | `ChartType` | Recommended chart type                               |
| `score`   | `number`    | Confidence score (0.0 – 1.0)                         |
| `reason`  | `string`    | Human-readable explanation                           |
| `preview` | `string`    | Text description of the expected chart               |
| `config`  | `object`    | Pre-built config you can pass directly to `render()` |

---

### Chart Lifecycle

#### `updateChart(container)`

Updates a specific chart (e.g., after pivot data changes).

```typescript
chartEngine.updateChart('#my-chart');
```

#### `updateAllCharts()`

Updates every active chart.

```typescript
chartEngine.updateAllCharts();
```

#### `destroyChart(container)`

Destroys a specific chart and frees its resources.

```typescript
chartEngine.destroyChart('#my-chart');
```

#### `destroyAll()`

Destroys all active charts.

#### `dispose()`

Cleans up the entire ChartEngine instance.

---

### Export

Export charts in multiple formats.

```typescript
// Image exports
await chartEngine.exportAsPng('#my-chart', 'sales-chart');
await chartEngine.exportAsSvg('#my-chart', 'sales-chart');
await chartEngine.exportAsPdf('#my-chart', 'sales-report');

// Data exports
await chartEngine.exportAsCsv('#my-chart', 'chart-data');
await chartEngine.exportAsJson('#my-chart', 'chart-data');

// Get blob without downloading
const blob = await chartEngine.getChartBlob('#my-chart', 'png');
```

#### Export Options

```typescript
await chartEngine.exportChart('#my-chart', {
  format: 'png', // 'png' | 'svg' | 'pdf' | 'csv' | 'json'
  filename: 'my-chart',
  width: 1200,
  height: 800,
  quality: 0.95,
  backgroundColor: '#ffffff',
  includeHeaders: true, // for CSV
  prettyPrint: true, // for JSON
});
```

---

### Accessors

| Method                  | Returns         | Description                         |
| ----------------------- | --------------- | ----------------------------------- |
| `getChartService()`     | `ChartService`  | Access the underlying data service  |
| `getChartDetector()`    | `ChartDetector` | Access the recommendation engine    |
| `getColorManager()`     | `ColorManager`  | Access the color palette manager    |
| `getChart(container)`   | `ChartInstance` | Get a specific active chart         |
| `getActiveContainers()` | `string[]`      | List all active chart container IDs |

---

## Standalone Recommendations

Use `ChartRecommender` to get chart recommendations without a `PivotEngine` — useful for any raw dataset.

```typescript
import {
  ChartRecommender,
  recommendCharts,
  getBestChartType,
} from '@mindfiredigital/pivothead-analytics';

const data = [
  { region: 'North', sales: 45000 },
  { region: 'South', sales: 38000 },
  // ...
];

const fields = {
  rows: ['region'],
  columns: [],
  measures: ['sales'],
};

// Get all recommendations
const recommendations = recommendCharts(data, fields);

// Get just the best chart type
const bestType = getBestChartType(data, fields); // e.g., 'pie'

// Full control via class
const profile = ChartRecommender.profileData(data, fields);
const recs = ChartRecommender.recommend(profile);
```

---

## Rendering Libraries

PivotHead Analytics supports multiple rendering libraries. Choose the one that best fits your project.

| Library        | Value       | Strengths                                                      |
| -------------- | ----------- | -------------------------------------------------------------- |
| Default        | `'chartjs'` | Lightweight, great for standard charts, bundled by default     |
| Apache ECharts | `'echarts'` | Rich interactivity, large chart variety, strong for dashboards |
| Plotly         | `'plotly'`  | Scientific charts, 3D support, built-in export                 |
| D3             | `'d3'`      | Maximum flexibility, fully customizable visualizations         |

### Switching Libraries

```typescript
// At initialization
const chartEngine = new ChartEngine(engine, { library: 'echarts' });

// Or per-chart
chartEngine.render({
  container: '#chart',
  type: 'line',
  library: 'plotly',
});
```

> **Note:** When using ECharts, Plotly, or D3, make sure the respective library is installed in your project (`echarts`, `plotly.js-dist`, or `d3`).

---

## Color Palettes

### Built-in Palettes

PivotHead Analytics comes with 15+ color palettes:

| Palette             | Description                               |
| ------------------- | ----------------------------------------- |
| `tableau10`         | Professional, visually distinct (default) |
| `colorBlind`        | Accessible for color vision deficiencies  |
| `categorical`       | Classic categorical colors                |
| `pastel`            | Soft, muted tones                         |
| `vibrant`           | Bold, high-saturation colors              |
| `sequentialBlues`   | Single-hue blue gradient                  |
| `sequentialGreens`  | Single-hue green gradient                 |
| `sequentialReds`    | Single-hue red gradient                   |
| `divergingRedBlue`  | Diverging scale with center point         |
| `divergingRedGreen` | Positive/negative diverging scale         |

### Using Palettes

```typescript
// Set globally via ChartEngine
const chartEngine = new ChartEngine(engine, {
  defaultStyle: { colorScheme: 'colorBlind' },
});

// Or per-chart
chartEngine.render({
  container: '#chart',
  type: 'pie',
  style: { colorScheme: 'vibrant' },
});

// Custom colors
chartEngine.render({
  container: '#chart',
  type: 'column',
  style: {
    colors: ['#6366f1', '#ec4899', '#22c55e', '#fb923c'],
  },
});
```

### ColorManager API

```typescript
import {
  ColorManager,
  getAvailablePalettes,
} from '@mindfiredigital/pivothead-analytics';

const colors = new ColorManager('tableau10');
colors.getColor(0); // first color
colors.getColors(5); // array of 5 colors
colors.getColorWithAlpha(0, 0.5); // color with transparency
colors.getGradient(0, 4, 10); // 10-step gradient between two colors
colors.setPalette('vibrant'); // switch palette

const palettes = getAvailablePalettes(); // list all palette names
```

---

## Value Formatting

Format chart values as currency, percentages, compact notation, and more.

```typescript
// Via ChartEngine config
chartEngine.render({
  container: '#chart',
  type: 'column',
  format: {
    valueFormat: 'currency', // 'number' | 'currency' | 'percent' | 'compact'
    currency: 'USD',
    locale: 'en-US',
    decimals: 2,
    prefix: '',
    suffix: '',
  },
});

// Standalone formatter
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
} from '@mindfiredigital/pivothead-analytics';

formatNumber(1234.5); // "1,234.5"
formatCurrency(1234.5, 'USD'); // "$1,234.50"
formatPercent(0.856); // "85.6%"
formatCompact(1500000); // "1.5M"
```

### ValueFormatter Class

```typescript
import { ValueFormatter } from '@mindfiredigital/pivothead-analytics';

const formatter = new ValueFormatter('en-US');
formatter.format(1234.5, { valueFormat: 'currency', currency: 'EUR' });
formatter.formatBytes(1048576); // "1 MB"
formatter.formatDuration(125000); // "2m 5s"
```

---

## Data Filtering

Control what data appears in your charts.

```typescript
const chartService = chartEngine.getChartService();

// Apply filters
chartService.setFilters({
  selectedMeasure: 'revenue',
  selectedRows: ['North', 'South'],
  selectedColumns: ['Laptops'],
  limit: 10, // Top 10 items
});

// Get available filter options (for building filter UIs)
const options = chartService.getAvailableFilterOptions();
// { measures: [...], rows: [...], columns: [...] }

// Check current filters
const current = chartService.getFilters();

// Reset to defaults
chartService.resetFilters();
```

---

## Interactions

### Click Events

```typescript
chartEngine.render({
  container: '#chart',
  type: 'column',
  interactions: {
    hover: true,
    click: data => {
      console.log('Row:', data.rowValue);
      console.log('Column:', data.columnValue);
      console.log('Value:', data.value);
      console.log('Measure:', data.measure);
    },
  },
});
```

### Drill-Down

Navigate through hierarchical data levels interactively.

```typescript
chartEngine.render({
  container: '#chart',
  type: 'column',
  interactions: {
    drillDown: {
      enabled: true,
      levels: ['region', 'country', 'city'],
      onDrill: (level, path) => {
        console.log(`Drilled into: ${level.value}`);
      },
      onDrillUp: path => {
        console.log('Drilled up');
      },
    },
  },
});
```

---

## Performance

Handle large datasets with built-in sampling and progressive rendering.

### Data Sampling

```typescript
const chartEngine = new ChartEngine(engine, {
  performance: {
    maxDataPoints: 5000,
    samplingMethod: 'lttb', // 'random' | 'stratified' | 'systematic' | 'lttb'
    enableSampling: true,
  },
});
```

| Sampling Method | Best For                                  |
| --------------- | ----------------------------------------- |
| `random`        | General purpose                           |
| `stratified`    | Preserving distribution across categories |
| `systematic`    | Evenly spaced selection                   |
| `lttb`          | Time series (preserves visual shape)      |

### Progressive Rendering

```typescript
import { renderProgressively } from '@mindfiredigital/pivothead-analytics';

await renderProgressively(chartEngine, {
  container: '#chart',
  type: 'line',
  chunkSize: 1000,
  onProgress: percent => {
    console.log(`Rendering: ${percent}%`);
  },
});
```

---

## Fluent Chart API

An alternative object-oriented API for building charts step by step.

```typescript
import {
  barChart,
  lineChart,
  pieChart,
} from '@mindfiredigital/pivothead-analytics';

// Build a bar chart fluently
const chart = barChart(engine)
  .container('#chart')
  .title('Sales by Region')
  .palette('vibrant')
  .legend(true, 'bottom')
  .grid(true)
  .animate(true)
  .build();

// Other chart builders
lineChart(engine).container('#line').title('Trends').build();
pieChart(engine).container('#pie').title('Share').build();
```

Available builders: `barChart`, `columnChart`, `horizontalBarChart`, `lineChart`, `areaChart`, `stackedAreaChart`, `stackedBarChart`, `pieChart`, `doughnutChart`, `scatterChart`, `heatmapChart`, `treemapChart`, `comboChart`, `barLineChart`, `areaLineChart`, `bubbleChart`.

---

## Types

### ChartType

```typescript
type ChartType =
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'stackedColumn'
  | 'stackedBar'
  | 'stackedArea'
  | 'comboBarLine'
  | 'comboAreaLine'
  | 'scatter'
  | 'histogram'
  | 'heatmap'
  | 'funnel'
  | 'sankey'
  | 'treemap';
```

### StyleConfig

```typescript
interface StyleConfig {
  title?: string;
  subtitle?: string;
  colorScheme?: string;
  colors?: string[];
  orientation?: 'vertical' | 'horizontal';
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  showValues?: boolean;
  animated?: boolean;
  height?: number;
  width?: number | 'auto';
}
```

### FormatConfig

```typescript
interface FormatConfig {
  valueFormat?: 'number' | 'currency' | 'percent' | 'compact';
  locale?: string;
  decimals?: number;
  currency?: string;
  prefix?: string;
  suffix?: string;
}
```

### ChartFilterConfig

```typescript
interface ChartFilterConfig {
  selectedMeasure?: string;
  selectedRows?: string[];
  selectedColumns?: string[];
  limit?: number;
}
```

### ChartEngineConfig

```typescript
interface ChartEngineConfig {
  container: string | HTMLElement;
  type?: ChartType;
  library?: 'chartjs' | 'echarts' | 'plotly' | 'd3';
  style?: StyleConfig;
  format?: FormatConfig;
  interactions?: InteractionConfig;
  export?: ExportConfig;
  data?: DataConfig;
}
```

### ChartInstance

The object returned by all render methods.

```typescript
interface ChartInstance {
  update(data?: unknown): void;
  destroy(): void;
  resize(): void;
  getCanvas(): HTMLCanvasElement | null;
}
```

---

## See Also

- [Pivot Charts Tutorial](/docs/tutorials/pivot-charts) — Step-by-step guide with examples
