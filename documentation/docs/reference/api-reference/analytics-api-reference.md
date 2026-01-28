---
id: analytics-api-reference
title: Analytics API Reference
sidebar_label: Analytics
description: Complete API reference for PivotHead Analytics charting library
keywords: [api, analytics, charts, chartservice, visualization]
---

# Analytics API Reference

Complete API reference for `@mindfiredigital/pivothead-analytics` package.

## Installation

```bash
npm install @mindfiredigital/pivothead-analytics
```

This package bundles Chart.js - no additional installation required.

---

## ChartService

The main class for transforming pivot table data into chart-ready formats.

### Constructor

```typescript
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine(data, config);
const chartService = new ChartService(engine);
```

### Methods

#### getChartData()

Returns data formatted for standard charts (bar, column, line, area).

```typescript
getChartData(config?: Partial<ChartConfig>): ChartData
```

**Returns:** `ChartData` - Chart.js compatible data structure

**Example:**

```typescript
const chartData = chartService.getChartData();
// { labels: ['Q1', 'Q2', ...], datasets: [...] }
```

---

#### getAggregatedChartData()

Returns aggregated data suitable for pie and doughnut charts.

```typescript
getAggregatedChartData(): ChartData
```

**Returns:** `ChartData` - Aggregated data with single dataset

**Example:**

```typescript
const pieData = chartService.getAggregatedChartData();
new Chart(canvas, { type: 'pie', data: pieData });
```

---

#### getStackedChartData()

Returns data formatted for stacked charts.

```typescript
getStackedChartData(): ChartData
```

**Returns:** `ChartData` - Data with multiple datasets for stacking

**Example:**

```typescript
const stackedData = chartService.getStackedChartData();
new Chart(canvas, {
  type: 'bar',
  data: stackedData,
  options: {
    scales: { x: { stacked: true }, y: { stacked: true } },
  },
});
```

---

#### getComboChartData()

Returns data for combination charts (bar + line, area + line).

```typescript
getComboChartData(): ChartData
```

**Returns:** `ChartData` - Data with datasets configured for mixed chart types

---

#### getScatterData()

Returns data formatted for scatter plots.

```typescript
getScatterData(): ScatterChartData
```

**Returns:** `ScatterChartData` - Data with x/y coordinate pairs

**Example:**

```typescript
const scatterData = chartService.getScatterData();
new Chart(canvas, { type: 'scatter', data: scatterData });
```

---

#### getHistogramData()

Returns data for histogram charts with configurable bins.

```typescript
getHistogramData(config?: Partial<ChartConfig>, numBins?: number): HistogramChartData
```

**Parameters:**

- `config` - Optional chart configuration
- `numBins` - Number of bins (default: 10)

**Returns:** `HistogramChartData` - Binned data with labels and counts

**Example:**

```typescript
const histData = chartService.getHistogramData({}, 8);
// { binLabels: ['0-10', '10-20', ...], binCounts: [5, 12, ...] }
```

---

#### getHeatmapData()

Returns data formatted for heatmap visualization.

```typescript
getHeatmapData(): HeatmapChartData
```

**Returns:** `HeatmapChartData` - Grid cells with values and min/max range

---

#### getDataForChartType()

Universal method that returns appropriate data for any chart type.

```typescript
getDataForChartType(type: ChartType, config?: Partial<ChartConfig>): ChartData
```

**Parameters:**

- `type` - One of the supported chart types
- `config` - Optional configuration

**Example:**

```typescript
const data = chartService.getDataForChartType('stackedColumn');
```

---

#### setFilters()

Applies filters to customize chart data.

```typescript
setFilters(config: ChartFilterConfig): void
```

**Parameters:**

```typescript
interface ChartFilterConfig {
  selectedMeasure?: string; // Measure to visualize
  selectedRows?: string[]; // Filter by row values
  selectedColumns?: string[]; // Filter by column values
  limit?: number; // Top N items (0 = no limit)
}
```

**Example:**

```typescript
chartService.setFilters({
  selectedMeasure: 'revenue',
  selectedRows: ['North', 'South'],
  limit: 5,
});
```

---

#### getFilters()

Returns the current filter configuration.

```typescript
getFilters(): ChartFilterConfig
```

---

#### resetFilters()

Resets all filters to default values.

```typescript
resetFilters(): void
```

---

#### getAvailableFilterOptions()

Returns available options for building filter UIs.

```typescript
getAvailableFilterOptions(): {
  measures: Array<{ uniqueName: string; caption: string }>;
  rows: string[];
  columns: string[];
}
```

---

### Classes

- `ChartService` - Main service for data transformation

### Chart.js Re-exports

- `Chart` - Chart.js constructor
- `registerables` - Chart.js components to register

### Constants

### Types

- `ChartType`
- `ChartFilterConfig`
- `ChartConfig`
- `ChartData`
- `ChartDataset`
- `ScatterChartData`
- `HeatmapChartData`
- `HistogramChartData`
- `SankeyChartData`
- `ChartConfiguration`
- `ChartOptions`
- `DEFAULT_CHART_COLORS` - Default color palette (10 colors)
- `DEFAULT_CHART_BORDER_COLORS` - Default border colors

---

## Color Palette

````
Default colors used for chart datasets:

```typescript
const DEFAULT_CHART_COLORS = [
  'rgba(54, 162, 235, 0.8)', // Blue
  'rgba(255, 99, 132, 0.8)', // Red
  'rgba(75, 192, 192, 0.8)', // Teal
  'rgba(255, 206, 86, 0.8)', // Yellow
  'rgba(153, 102, 255, 0.8)', // Purple
  'rgba(255, 159, 64, 0.8)', // Orange
  'rgba(46, 204, 113, 0.8)', // Green
  'rgba(231, 76, 60, 0.8)', // Dark Red
  'rgba(52, 73, 94, 0.8)', // Dark Blue
  'rgba(241, 196, 15, 0.8)', // Gold
];

---

## See Also

- [Pivot Charts Tutorial](/docs/tutorials/pivot-charts) - Interactive examples
````
