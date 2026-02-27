# @mindfiredigital/pivothead-analytics

Data visualization and analytics module for [PivotHead](https://github.com/mindfiredigital/PivotHead). Transform your pivot table data into beautiful, interactive charts.

Supports **Chart.js**, **Apache ECharts**, **Plotly.js**, and **D3.js** — install whichever you prefer.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/pivothead-analytics)](https://www.npmjs.com/package/@mindfiredigital/pivothead-analytics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install @mindfiredigital/pivothead-analytics
```

After installation, an interactive prompt will ask which charting library you want to use. Install it separately:

```bash
# Pick one (or more)
npm install chart.js          # Chart.js  (default / recommended)
npm install echarts            # Apache ECharts
npm install plotly.js-dist     # Plotly.js
npm install d3                 # D3.js
```

> To skip the prompt (e.g. in CI), set `PIVOTHEAD_SKIP_SETUP=true`.

---

## Quick Start

### Using ChartEngine (Recommended)

`ChartEngine` auto-detects your installed charting library and handles rendering automatically.

```typescript
import { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartEngine } from '@mindfiredigital/pivothead-analytics';

const data = [
  { country: 'USA', category: 'Electronics', sales: 1500 },
  { country: 'USA', category: 'Clothing', sales: 800 },
  { country: 'Canada', category: 'Electronics', sales: 1200 },
  { country: 'Canada', category: 'Clothing', sales: 600 },
];

const options = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [{ uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' }],
};

const engine = new PivotEngine(data, options);
const chartEngine = new ChartEngine(engine);

// Let the engine pick the best chart type automatically
chartEngine.auto({ container: '#chart', style: { title: 'Sales by Country' } });

// — or use a specific chart type —
chartEngine.bar({ container: '#chart' });
chartEngine.pie({ container: '#chart' });
chartEngine.line({ container: '#chart' });
```

### Get Chart Recommendations

```typescript
const recommendations = chartEngine.recommend();
console.log(recommendations[0]);
// { type: 'bar', score: 0.95, reason: 'Best for comparing categories' }
```

### Export Charts

```typescript
await chartEngine.exportAsPng('#chart', 'my-chart'); // saves as PNG
await chartEngine.exportAsCsv('#chart', 'chart-data'); // saves as CSV
```

---

## Supported Chart Types

| Category    | Types                                        |
| ----------- | -------------------------------------------- |
| Basic       | `column`, `bar`, `line`, `area`              |
| Circular    | `pie`, `doughnut`                            |
| Stacked     | `stackedColumn`, `stackedBar`, `stackedArea` |
| Combo       | `comboBarLine`, `comboAreaLine`              |
| Statistical | `scatter`, `histogram`                       |
| Specialized | `heatmap`, `funnel`, `sankey`, `treemap`     |

---

## Multiple Charting Libraries

The library is auto-detected at runtime. You can also force a specific one:

```typescript
// Via environment variable
PIVOTHEAD_LIBRARY=echarts node app.js

// Or pass it directly
const chartEngine = new ChartEngine(engine, { library: 'echarts' });
```

---

## Using ChartService (Legacy API)

If you prefer managing Chart.js yourself:

```typescript
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js'; // install chart.js separately

Chart.register(...registerables);

const chartService = new ChartService(engine);

// Optional: filter the data
chartService.setFilters({
  selectedMeasure: 'sales',
  selectedRows: ['USA', 'Canada'],
  limit: 10,
});

const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: { responsive: true },
});
```

### ChartService methods

| Method                        | Description                                |
| ----------------------------- | ------------------------------------------ |
| `getChartData()`              | Data for bar / line / column / area charts |
| `getAggregatedChartData()`    | Data for pie / doughnut charts             |
| `getStackedChartData()`       | Data for stacked charts                    |
| `getComboChartData()`         | Data for combo charts                      |
| `getScatterData()`            | Data for scatter plots                     |
| `getHeatmapData()`            | Data for heatmap charts                    |
| `getHistogramData(bins?)`     | Data for histogram charts                  |
| `getDataForChartType(type)`   | Universal — picks the right method by type |
| `setFilters(config)`          | Apply row / column / measure filters       |
| `getAvailableFilterOptions()` | List available filter values               |
| `resetFilters()`              | Clear all filters                          |

---

## Fluent Chart API

Individual chart classes with a fluent builder API:

```typescript
import {
  barChart,
  pieChart,
  lineChart,
} from '@mindfiredigital/pivothead-analytics';

barChart(engine)
  .title('Sales Report')
  .colors(['#4e79a7', '#f28e2b'])
  .render('#chart');
```

Available builders: `barChart`, `horizontalBarChart`, `columnChart`, `stackedBarChart`, `lineChart`, `areaChart`, `stackedAreaChart`, `pieChart`, `doughnutChart`, `scatterChart`, `bubbleChart`, `heatmapChart`, `treemapChart`, `comboChart`, `barLineChart`, `areaLineChart`.

---

## Browser Support

Works with all modern browsers (Chrome, Firefox, Safari, Edge — latest versions).

---

## Links

- [GitHub Repository](https://github.com/mindfiredigital/PivotHead)
- [PivotHead Core Package](https://www.npmjs.com/package/@mindfiredigital/pivothead)
- [Chart.js](https://www.chartjs.org) · [ECharts](https://echarts.apache.org) · [Plotly](https://plotly.com/javascript/) · [D3](https://d3js.org)

---

## License

[MIT](https://opensource.org/licenses/MIT) © Mindfiredigital
