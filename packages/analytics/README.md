# @mindfiredigital/pivothead-analytics

Data visualization and analytics module for PivotHead. Transform your pivot table data into beautiful, interactive charts with ease.

**Chart.js is included** - no additional dependencies required!

## Installation

```bash
npm install @mindfiredigital/pivothead-analytics
```

This package includes:

- `@mindfiredigital/pivothead` (core pivot engine)
- `chart.js` (chart rendering library)

No need to install them separately!

## Quick Start

```typescript
import { PivotEngine } from '@mindfiredigital/pivothead';
import {
  ChartService,
  Chart,
  registerables,
} from '@mindfiredigital/pivothead-analytics';

// Register Chart.js components (do this once in your app)
Chart.register(...registerables);

// Your data
const data = [
  { country: 'USA', category: 'Electronics', sales: 1500 },
  { country: 'USA', category: 'Clothing', sales: 800 },
  { country: 'Canada', category: 'Electronics', sales: 1200 },
  { country: 'Canada', category: 'Clothing', sales: 600 },
];

// Pivot configuration
const options = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [
    { uniqueName: 'sales', caption: 'Total Sales', aggregation: 'sum' },
  ],
};

// Create engine and chart service
const engine = new PivotEngine(data, options);
const chartService = new ChartService(engine);

// Get chart data and render
const canvas = document.getElementById('myChart') as HTMLCanvasElement;
const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: { responsive: true },
});
```

## Supported Chart Types

### Basic Charts

- `column` - Vertical bar chart
- `bar` - Horizontal bar chart
- `line` - Line chart
- `area` - Area chart (filled line)

### Circular Charts

- `pie` - Pie chart
- `doughnut` - Doughnut chart

### Stacked Charts

- `stackedColumn` - Stacked vertical bars
- `stackedBar` - Stacked horizontal bars
- `stackedArea` - Stacked area chart

### Combo Charts

- `comboBarLine` - Combined bar and line
- `comboAreaLine` - Combined area and line

### Statistical Charts

- `scatter` - Scatter plot
- `histogram` - Histogram

### Specialized Charts

- `heatmap` - Heat map visualization
- `funnel` - Funnel chart
- `sankey` - Sankey diagram

## API Reference

### ChartService

The main class for transforming pivot data into chart-ready format.

#### Constructor

```typescript
const chartService = new ChartService(engine: PivotEngine);
```

#### Methods

##### `setFilters(config: ChartFilterConfig): void`

Set filters to customize chart data.

```typescript
chartService.setFilters({
  selectedMeasure: 'sales', // Which measure to visualize
  selectedRows: ['USA', 'Canada'], // Filter by row values
  selectedColumns: ['Electronics'], // Filter by column values
  limit: 10, // Top N items (0 = no limit)
});
```

##### `getFilters(): ChartFilterConfig`

Get current filter configuration.

##### `resetFilters(): void`

Reset all filters to defaults.

##### `getAvailableFilterOptions()`

Get available options for filters.

```typescript
const options = chartService.getAvailableFilterOptions();
// Returns: { measures, rows, columns }
```

##### `getChartData(config?: Partial<ChartConfig>): ChartData`

Get data for standard charts (bar, line, column, area).

```typescript
const chartData = chartService.getChartData();
// Returns Chart.js compatible data: { labels, datasets }
```

##### `getAggregatedChartData(): ChartData`

Get aggregated data for pie/doughnut charts.

##### `getScatterData(): ScatterChartData`

Get data for scatter plots.

##### `getHeatmapData(): HeatmapChartData`

Get data for heatmap visualization.

##### `getHistogramData(config?, numBins?): HistogramChartData`

Get data for histogram charts.

##### `getStackedChartData(): ChartData`

Get data for stacked charts.

##### `getComboChartData(): ChartData`

Get data for combo charts (bar + line, area + line).

##### `getDataForChartType(type: ChartType, config?): ChartData`

Universal method that returns appropriate data for any chart type.

```typescript
const data = chartService.getDataForChartType('pie');
```

## Examples

### Bar Chart with Filters

```typescript
import {
  ChartService,
  Chart,
  registerables,
} from '@mindfiredigital/pivothead-analytics';

Chart.register(...registerables);

const chartService = new ChartService(engine);

// Apply filters
chartService.setFilters({
  selectedMeasure: 'revenue',
  selectedRows: ['Q1', 'Q2', 'Q3', 'Q4'],
  limit: 5,
});

// Render chart
const chartData = chartService.getChartData();
new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Quarterly Revenue' },
    },
  },
});
```

### Pie Chart

```typescript
chartService.setFilters({ selectedMeasure: 'sales' });
const pieData = chartService.getAggregatedChartData();

new Chart(canvas, {
  type: 'pie',
  data: pieData,
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
    },
  },
});
```

### Stacked Bar Chart

```typescript
const stackedData = chartService.getStackedChartData();

new Chart(canvas, {
  type: 'bar',
  data: stackedData,
  options: {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  },
});
```

### Dynamic Chart Type

```typescript
function renderChart(type: ChartType) {
  const data = chartService.getDataForChartType(type);

  // Map to Chart.js types
  const chartJsType =
    {
      column: 'bar',
      bar: 'bar',
      line: 'line',
      pie: 'pie',
      doughnut: 'doughnut',
    }[type] || 'bar';

  new Chart(canvas, {
    type: chartJsType,
    data: data,
    options: { responsive: true },
  });
}
```

## Exports

### Classes

- `ChartService` - Main service for chart data transformation

### Chart.js Re-exports

- `Chart` - Chart.js constructor
- `registerables` - Chart.js components to register

### Types

- `ChartType` - Union type of all supported chart types
- `ChartFilterConfig` - Filter configuration interface
- `ChartConfig` - Chart configuration interface
- `ChartData` - Chart.js compatible data structure
- `ChartDataset` - Dataset structure
- `ScatterChartData` - Scatter plot data
- `HeatmapChartData` - Heatmap data
- `HistogramChartData` - Histogram data
- `SankeyChartData` - Sankey diagram data
- `ChartConfiguration` - Chart.js configuration type
- `ChartOptions` - Chart.js options type

### Constants

- `DEFAULT_CHART_COLORS` - Default color palette for charts
- `DEFAULT_CHART_BORDER_COLORS` - Default border colors

## Browser Support

This package supports all modern browsers that are compatible with Chart.js 4.x:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Links

- [PivotHead Repository](https://github.com/mindfiredigital/PivotHead)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
