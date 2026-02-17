# PivotHead Analytics - RFC Feature Demo

Comprehensive demonstration of all features from the `@mindfiredigital/pivothead-analytics` RFC.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run the demo
pnpm run dev

# Build for production
pnpm run build
```

The demo will open at http://localhost:3000

## Features Demonstrated

### 1. Multiple Chart Library Support

Render the same data using different chart rendering backends:

- **Chart.js** - Default renderer, good all-around choice
- **ECharts** - Apache ECharts, excellent for complex visualizations
- **Plotly.js** - Interactive scientific charts
- **D3.js** - Low-level SVG rendering

### 2. Chart Classes with Fluent API

Configure charts using the builder pattern:

```javascript
const chart = new BarChart()
  .title('Sales Performance')
  .colorScheme('tableau10')
  .legend(true, 'top')
  .asStacked()
  .asHorizontal();
```

Available classes:

- `BarChart` / `barChart()`
- `LineChart` / `lineChart()`
- `PieChart` / `pieChart()`
- `ScatterChart` / `scatterChart()`
- `HeatmapChart` / `heatmapChart()`
- `ComboChart` / `comboChart()`
- `TreemapChart` / `treemapChart()`

### 3. All Chart Types

Visual showcase of all supported chart types:

- Column / Bar (horizontal)
- Line / Area
- Stacked Column / Stacked Area
- Pie / Doughnut
- Scatter
- Heatmap
- Combo (Bar + Line)
- Treemap

### 4. Smart Chart Recommendations

`ChartRecommender` analyzes your data and suggests the best chart types:

```javascript
const profile = ChartRecommender.profileData(data, fields);
const recommendations = ChartRecommender.recommend(profile);
// Returns: [{ type: 'bar', score: 0.95, reason: '...' }, ...]
```

Scenarios:

- Single category (few values) → Pie chart
- Multiple categories → Grouped bar chart
- Time series → Line chart
- Comparison matrix → Heatmap
- Hierarchical data → Treemap
- Correlation data → Scatter plot

### 5. Data Sampling for Large Datasets

`DataSampler` provides efficient algorithms for large datasets:

```javascript
const sampler = new DataSampler({
  maxDataPoints: 100,
  samplingMethod: 'lttb', // Largest Triangle Three Buckets
});
const sampled = sampler.sample(largeDataset);
```

Methods:

- **LTTB** - Preserves visual shape (recommended)
- **Random** - Simple random sampling
- **Systematic** - Every Nth point

### 6. Drill-Down Navigation

`DrillDownManager` enables hierarchical exploration:

```javascript
const drillDown = new DrillDownManager({
  levels: ['region', 'country', 'department'],
  onDrill: (level, path) => updateChart(path),
});

// Click handlers
drillDown.drillDown('North America'); // Go deeper
drillDown.drillUp(); // Go back
drillDown.reset(); // Start over
```

### 7. Data Transformation Utilities

`DataTransformer` converts between data formats:

```javascript
// Aggregate multiple datasets
DataTransformer.aggregate(data, 'sum');

// Transpose rows/columns
DataTransformer.transpose(data);

// Normalize to percentages
DataTransformer.normalize(data, 'column');

// Convert to heatmap format
DataTransformer.toHeatmap(data);

// Limit to top N
DataTransformer.applyLimit(data, 5, 'value', 'desc');
```

### 8. Color Palettes & Formatting

Choose from predefined palettes and customize value formatting:

Palettes:

- `tableau10` - Tableau's 10-color palette
- `category10` - D3's category colors
- `pastel` - Soft pastel colors
- `dark` - Dark theme colors
- `colorblind` - Accessible colors
- `sequential` - Single-hue gradient

Formats:

- Number (standard formatting)
- Currency ($1,234.56)
- Percent (45.6%)
- Compact (1.2M)

## Project Structure

```
analytics-demo/
├── index.html      # Main HTML with section layout
├── main.js         # Demo logic and feature tests
├── style.css       # Styling
├── package.json    # Dependencies
├── vite.config.js  # Vite configuration
└── README.md       # This file
```

## Dependencies

- `@mindfiredigital/pivothead` - Core pivot engine
- `@mindfiredigital/pivothead-analytics` - Analytics/charting package
- `chart.js` - Default chart library (included)
- `echarts` - Apache ECharts (CDN)
- `plotly.js-dist` - Plotly.js (CDN)
- `d3` - D3.js (CDN)

## Console Logging

Click events are logged to the browser console. Open DevTools to see:

- Chart click data
- Drill-down navigation events
- Recommendation profiles

## RFC Features Checklist

- [x] Multiple chart libraries (Chart.js, ECharts, Plotly, D3)
- [x] Individual chart classes with fluent API
- [x] All chart types (bar, line, pie, scatter, heatmap, treemap, combo)
- [x] ChartEngine with library selection
- [x] ChartRecommender for smart suggestions
- [x] DataSampler with LTTB algorithm
- [x] DrillDownManager for hierarchical navigation
- [x] DataTransformer for data format conversion
- [x] ColorManager with multiple palettes
- [x] Value formatters (currency, percent, compact)
- [x] Click interactions and event handling
