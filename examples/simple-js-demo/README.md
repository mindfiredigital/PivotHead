# Simple JS Demo for PivotHead

This example showcases the core functionalities of PivotHead using plain JavaScript. It demonstrates how to integrate and use the PivotHead library with the Analytics package for data visualization.

## Features

- **Table View**: Interactive pivot table with sorting, filtering, and pagination
- **Analytics View**: Chart-only visualization with 12+ chart types
- **Tab Navigation**: Easy switching between Table and Analytics views
- **No CDN Required**: Chart.js is bundled with the analytics package

## Dependencies

```json
{
  "@mindfiredigital/pivothead": "workspace:*",
  "@mindfiredigital/pivothead-analytics": "workspace:*"
}
```

The `@mindfiredigital/pivothead-analytics` package includes:

- `ChartService` - Transforms pivot data to chart format
- `Chart` - Chart.js constructor (bundled)
- `registerables` - Chart.js components to register

**No need to install Chart.js separately!**

## Installation & Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### Importing from Analytics Package

```javascript
import {
  ChartService,
  Chart,
  registerables,
} from '@mindfiredigital/pivothead-analytics';
import { PivotEngine } from '@mindfiredigital/pivothead';

// Register Chart.js components (do this once)
Chart.register(...registerables);

// Create pivot engine
const engine = new PivotEngine(data, config);

// Create chart service
const chartService = new ChartService(engine);
```

### Rendering Charts

```javascript
// Set filters
chartService.setFilters({
  selectedMeasure: 'price',
  selectedRows: ['USA', 'Canada'],
  selectedColumns: ['Electronics'],
  limit: 10,
});

// Get chart data
const chartData = chartService.getChartData();

// Render with Chart.js
const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');

new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: { responsive: true },
});
```

## Analytics View

The Analytics tab provides powerful data visualization with the following chart types:

### Supported Chart Types

| Category    | Charts                                    |
| ----------- | ----------------------------------------- |
| Basic       | Column, Bar, Line, Area                   |
| Circular    | Pie, Doughnut                             |
| Stacked     | Stacked Column, Stacked Bar, Stacked Area |
| Statistical | Scatter, Histogram                        |
| Specialized | Heatmap                                   |

### Chart Filters

- **Measure**: Select which metric to visualize
- **Rows**: Filter by row dimension values
- **Categories**: Filter by column dimension values
- **Limit**: Show top N items (All, Top 3, 5, 10, 15, 20)

### How It Works

1. Click the **Analytics** tab button to switch to chart view
2. Select a **Chart Type** from the dropdown
3. Configure **Filters** as needed
4. Click **Apply Filter** to update the chart
5. Click **Reset** to restore default filters
6. Click **Table** tab to return to table view

## Project Structure

```
simple-js-demo/
├── index.html          # Main HTML with tab navigation
├── index.js            # Main JavaScript with chart logic
├── style.css           # Styles for table and charts
├── config/
│   ├── config.js       # Pivot configuration
│   └── data.json       # Sample data
├── header/
│   └── header.js       # Header controls
├── services/
│   ├── VirtualScroller.js
│   ├── exportService.js
│   ├── fieldsPopup.js
│   └── ...
└── package.json
```

## Key Features

### Table View

- Sortable columns with click
- Drag-and-drop column/row reordering
- Virtual scrolling for large datasets
- Pagination controls
- Export to Excel/PDF/CSV
- Filter by any field
- Grouping and aggregation

### Analytics View

- Real-time chart rendering
- Interactive filter controls
- Multiple chart types
- Automatic data transformation via ChartService
- Responsive chart sizing

## ChartService API

### Methods

```javascript
// Set filter configuration
chartService.setFilters({
  selectedMeasure: string,
  selectedRows: string[],
  selectedColumns: string[],
  limit: number,
});

// Get current filters
const filters = chartService.getFilters();

// Reset to defaults
chartService.resetFilters();

// Get available options for filters
const options = chartService.getAvailableFilterOptions();
// Returns: { measures, rows, columns }

// Get chart data (standard charts)
const data = chartService.getChartData();

// Get data for specific chart types
const pieData = chartService.getAggregatedChartData();
const scatterData = chartService.getScatterData();
const heatmapData = chartService.getHeatmapData();
const histogramData = chartService.getHistogramData({}, 10);
const stackedData = chartService.getStackedChartData();
```

## Related

- [PivotHead Core Package](../../packages/core/)
- [PivotHead Analytics Package](../../packages/analytics/)
- [Vue Example](../vue-example/)
- [React Example](../react-demo/)
