---
id: analytics-api-reference
title: Analytics API Reference
sidebar_label: Analytics
description: Complete API reference for PivotHead Analytics — data visualization and charting for pivot tables
keywords:
  [
    api,
    analytics,
    charts,
    visualization,
    pivothead,
    chart.js,
    echarts,
    plotly,
    d3,
  ]
---

# Analytics API Reference

Complete reference for `@mindfiredigital/pivothead-analytics`.

---

## Installation

```bash
npm install @mindfiredigital/pivothead-analytics
```

This package does **not** bundle a charting library. You must install one separately:

```bash
npm install chart.js          # Chart.js (recommended, most common)
npm install echarts            # Apache ECharts
npm install plotly.js-dist     # Plotly.js
npm install d3                 # D3.js
```

After install, a setup prompt runs automatically to help you pick the library. You can skip it with:

```bash
PIVOTHEAD_SKIP_SETUP=true npm install @mindfiredigital/pivothead-analytics
```

---

## ChartEngine

`ChartEngine` is the main class. It takes a `PivotEngine` instance and renders charts.

### Constructor

```typescript
import { ChartEngine } from '@mindfiredigital/pivothead-analytics';
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine(data, config);

const chartEngine = new ChartEngine(engine);
// or with options:
const chartEngine = new ChartEngine(engine, {
  library: 'chartjs', // 'chartjs' | 'echarts' | 'plotly' | 'd3'
  defaultStyle: {
    colorScheme: 'tableau10',
    animated: true,
    showLegend: true,
  },
  defaultFormat: {
    valueFormat: 'currency',
    currency: 'USD',
  },
});
```

#### ChartEngineOptions

| Option          | Type                                         | Default       | Description                               |
| --------------- | -------------------------------------------- | ------------- | ----------------------------------------- |
| `library`       | `'chartjs' \| 'echarts' \| 'plotly' \| 'd3'` | auto-detected | Rendering library to use                  |
| `defaultStyle`  | `StyleConfig`                                | —             | Default style applied to every chart      |
| `defaultFormat` | `FormatConfig`                               | —             | Default value formatting for every chart  |
| `performance`   | `PerformanceConfig`                          | —             | Data sampling settings for large datasets |

If `library` is not set, ChartEngine auto-detects by checking the `PIVOTHEAD_LIBRARY` env var, browser globals, and installed packages.

---

## Rendering methods

### `render(config)`

Full control render. Use this when you need specific type, style, or interactions.

```typescript
chartEngine.render({
  container: '#my-chart', // CSS selector or HTMLElement
  type: 'column', // see ChartType below
  style: {
    title: 'Revenue by Region',
    showLegend: true,
    legendPosition: 'bottom',
    showGrid: true,
    animated: true,
    colorScheme: 'vibrant',
  },
  format: {
    valueFormat: 'currency',
    currency: 'USD',
  },
  interactions: {
    hover: true,
    click: data => console.log('Clicked:', data.rowValue, data.value),
  },
});
```

### `auto(config)`

Auto-detects the best chart type from your data structure and renders it.

```typescript
chartEngine.auto({
  container: '#my-chart',
  style: { title: 'Sales Overview' },
});
```

### Convenience methods

One-liner shorthand for every chart type:

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
chartEngine.combo({ container: '#chart' }); // bar + line combo
```

All accept the same `Omit<ChartEngineConfig, 'type'>` options as `render()`.

---

## Recommendations

The engine analyses your pivot structure and returns ranked chart type suggestions.

### `recommend()`

Returns all recommendations sorted by confidence score.

```typescript
const recommendations = chartEngine.recommend();

recommendations.forEach(rec => {
  console.log(`${rec.type}: ${Math.round(rec.score * 100)}% — ${rec.reason}`);
});
// e.g. "line: 96% — Time dimension detected, line chart shows trends over time"
```

### `getBestRecommendation()`

Returns the single highest-scored recommendation.

```typescript
const best = chartEngine.getBestRecommendation();
console.log(best.type); // e.g. 'line'
console.log(best.reason); // e.g. 'Time dimension detected...'
```

### `renderRecommendation(recommendation, container, overrides?)`

Renders a chart directly from a recommendation object.

```typescript
const recs = chartEngine.recommend();
chartEngine.renderRecommendation(recs[0], '#my-chart');

// With optional style overrides:
chartEngine.renderRecommendation(recs[0], '#my-chart', {
  style: { animated: true },
});
```

#### ChartRecommendation object

| Field     | Type        | Description                                   |
| --------- | ----------- | --------------------------------------------- |
| `type`    | `ChartType` | Recommended chart type                        |
| `score`   | `number`    | Confidence (0.0 – 1.0)                        |
| `reason`  | `string`    | Human-readable explanation                    |
| `preview` | `string`    | Text summary of the expected chart            |
| `config`  | `object`    | Pre-built config, pass directly to `render()` |

---

## Chart lifecycle

### `updateChart(container)`

Re-fetches data from PivotEngine and updates one chart.

```typescript
chartEngine.updateChart('#my-chart');
```

### `updateAllCharts()`

Updates every active chart.

```typescript
chartEngine.updateAllCharts();
```

### `destroyChart(container)`

Destroys one chart and frees its resources.

```typescript
chartEngine.destroyChart('#my-chart');
```

### `destroyAll()`

Destroys all active charts.

```typescript
chartEngine.destroyAll();
```

### `dispose()`

Destroys all charts **and** unsubscribes from the PivotEngine. Call this when you remove the chart from your UI.

```typescript
chartEngine.dispose();
```

---

## Export

### Quick export methods

```typescript
await chartEngine.exportAsPng('#my-chart', 'filename');
await chartEngine.exportAsSvg('#my-chart', 'filename');
await chartEngine.exportAsPdf('#my-chart', 'filename'); // requires jspdf peer dep
await chartEngine.exportAsCsv('#my-chart', 'filename');
await chartEngine.exportAsJson('#my-chart', 'filename');
```

### `exportChart(container, options)`

Full control export.

```typescript
await chartEngine.exportChart('#my-chart', {
  format: 'png', // 'png' | 'svg' | 'pdf' | 'csv' | 'json'
  filename: 'my-chart',
  width: 1200,
  height: 800,
  quality: 0.95,
  backgroundColor: '#ffffff',
  includeHeaders: true, // CSV only
  prettyPrint: true, // JSON only
});
```

### `getChartBlob(container, format)`

Returns a `Blob` without triggering a download.

```typescript
const blob = await chartEngine.getChartBlob('#my-chart', 'png');
// upload via FormData, send in email, etc.
```

---

## Accessors

| Method                  | Returns                      | Description                           |
| ----------------------- | ---------------------------- | ------------------------------------- |
| `getChartService()`     | `ChartService`               | Access the data service for filtering |
| `getChartDetector()`    | `ChartDetector`              | Access the recommendation engine      |
| `getColorManager()`     | `ColorManager`               | Access the colour palette manager     |
| `getChart(container)`   | `ChartInstance \| undefined` | Get a specific active chart           |
| `getActiveContainers()` | `string[]`                   | List all active chart container IDs   |

---

## Data filtering (ChartService)

Use `getChartService()` to filter what data the chart displays.

```typescript
const chartService = chartEngine.getChartService();

// Apply filters
chartService.setFilters({
  selectedMeasure: 'revenue',
  selectedRows: ['North', 'South'],
  selectedColumns: ['Laptops'],
  limit: 10, // top N items
});

// Re-render all charts to reflect new filters
chartEngine.updateAllCharts();

// Get all available filter values (use to build dropdowns)
const options = chartService.getAvailableFilterOptions();
// options.measures → [{ uniqueName: 'revenue', caption: 'Revenue' }, ...]
// options.rows     → ['North', 'South', 'East', 'West']
// options.columns  → ['Laptops', 'Phones', 'Tablets']

// Read current filters
const current = chartService.getFilters();

// Clear all filters
chartService.resetFilters();
```

---

## Colour palettes

### Built-in palettes

| Name                   | Description                               |
| ---------------------- | ----------------------------------------- |
| `tableau10`            | Professional, distinct (default)          |
| `colorBlind`           | Accessible for colour vision deficiencies |
| `categorical`          | Classic categorical colours               |
| `pastel`               | Soft, muted tones                         |
| `vibrant`              | Bold, high-saturation                     |
| `sequentialBlues`      | Single-hue blue gradient                  |
| `sequentialGreens`     | Single-hue green gradient                 |
| `sequentialReds`       | Single-hue red gradient                   |
| `sequentialOranges`    | Single-hue orange gradient                |
| `sequentialPurples`    | Single-hue purple gradient                |
| `divergingRedBlue`     | Diverging scale with centre point         |
| `divergingRedGreen`    | Positive/negative diverging scale         |
| `divergingPurpleGreen` | Alternative diverging scale               |

### Using palettes

```typescript
// Set globally
const chartEngine = new ChartEngine(engine, {
  defaultStyle: { colorScheme: 'colorBlind' },
});

// Or per chart
chartEngine.render({
  container: '#chart',
  type: 'pie',
  style: { colorScheme: 'vibrant' },
});

// Custom hex colours
chartEngine.render({
  container: '#chart',
  type: 'column',
  style: { colors: ['#6366f1', '#ec4899', '#22c55e', '#fb923c'] },
});
```

### ColorManager API

```typescript
import {
  ColorManager,
  getAvailablePalettes,
} from '@mindfiredigital/pivothead-analytics';

const colors = new ColorManager('tableau10');
colors.getColor(0); // first colour in the palette
colors.getColors(5); // array of 5 colours
colors.getColorWithAlpha(0, 0.5); // colour with transparency
colors.getGradient(0, 4, 10); // 10-step gradient between two colours
colors.setPalette('vibrant'); // switch to a different palette

getAvailablePalettes(); // returns list of all palette names
```

---

## Value formatting

### Via chart config

```typescript
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
```

### Standalone format functions

```typescript
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

### ValueFormatter class

```typescript
import { ValueFormatter } from '@mindfiredigital/pivothead-analytics';

const formatter = new ValueFormatter('en-US');
formatter.format(1234.5, { valueFormat: 'currency', currency: 'EUR' });
formatter.formatBytes(1048576); // "1 MB"
formatter.formatDuration(125000); // "2m 5s"
```

---

## Click interactions

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

---

## Rendering libraries

### Selecting a library

```typescript
// At construction (applies to all charts)
const chartEngine = new ChartEngine(engine, { library: 'echarts' });

// Per-chart override
chartEngine.render({
  container: '#chart',
  type: 'line',
  library: 'plotly',
});
```

### Library comparison

| Library        | Value       | Best for                          |
| -------------- | ----------- | --------------------------------- |
| Chart.js       | `'chartjs'` | Standard charts, lightweight apps |
| Apache ECharts | `'echarts'` | Rich interactivity, dashboards    |
| Plotly         | `'plotly'`  | Scientific charts, 3D             |
| D3             | `'d3'`      | Fully custom visualisations       |

> Make sure the corresponding npm package is installed before using a library other than the default.

---

## Standalone recommendations (without PivotEngine)

Use `ChartRecommender` to get chart suggestions from any raw dataset:

```typescript
import {
  ChartRecommender,
  recommendCharts,
  getBestChartType,
} from '@mindfiredigital/pivothead-analytics';

const data = [
  { region: 'North', sales: 45000 },
  { region: 'South', sales: 38000 },
];

const fields = {
  rows: ['region'],
  columns: [],
  measures: ['sales'],
};

// All recommendations
const recs = recommendCharts(data, fields);

// Just the best type
const bestType = getBestChartType(data, fields); // e.g. 'pie'

// Full class API
const profile = ChartRecommender.profileData(data, fields);
const allRecs = ChartRecommender.recommend(profile);
```

---

## Progressive rendering (large datasets)

For datasets with many rows, render in chunks with a progress callback:

```typescript
import { renderProgressively } from '@mindfiredigital/pivothead-analytics';

await renderProgressively(chartEngine, {
  container: '#chart',
  type: 'line',
  chunkSize: 1000,
  onProgress: percent => {
    progressBar.style.width = `${percent}%`;
  },
});
```

### Data sampling

Reduce data points while preserving visual accuracy:

```typescript
const chartEngine = new ChartEngine(engine, {
  performance: {
    maxDataPoints: 5000,
    samplingMethod: 'lttb', // 'random' | 'stratified' | 'systematic' | 'lttb'
    enableSampling: true,
  },
});
```

| Method       | Best for                             |
| ------------ | ------------------------------------ |
| `random`     | General purpose                      |
| `stratified` | Preserving category distribution     |
| `systematic` | Evenly spaced selection              |
| `lttb`       | Time series (preserves visual shape) |

---

## Fluent builder API

An alternative step-by-step API for building charts. Useful for conditional or dynamic config.

```typescript
import {
  barChart,
  lineChart,
  pieChart,
} from '@mindfiredigital/pivothead-analytics';

const chart = barChart(engine)
  .container('#chart')
  .title('Revenue by Region')
  .palette('vibrant')
  .legend(true, 'bottom')
  .grid(true)
  .animate(true)
  .build();
```

Available builders: `barChart`, `columnChart`, `horizontalBarChart`, `lineChart`, `areaChart`,
`stackedAreaChart`, `stackedBarChart`, `pieChart`, `doughnutChart`, `scatterChart`,
`heatmapChart`, `treemapChart`, `comboChart`, `barLineChart`, `areaLineChart`, `bubbleChart`.

---

## Types reference

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
}
```

### ChartInstance

Object returned by all render methods.

```typescript
interface ChartInstance {
  update(data?: unknown): void;
  destroy(): void;
  resize(): void;
  getCanvas(): HTMLCanvasElement | null;
}
```

---

## See also

- [Pivot Charts Tutorial](/docs/tutorials/pivot-charts) — Step-by-step guide with examples
