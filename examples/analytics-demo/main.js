/**
 * PivotHead Analytics - RFC Feature Demo
 * Comprehensive demonstration of all analytics features
 */

import { PivotEngine } from '@mindfiredigital/pivothead';
import {
  // Core
  ChartEngine,
  ChartService,
  DataTransformer,
  ChartRecommender,
  DrillDownManager,

  // Renderers
  ChartJsRenderer,
  EChartsRenderer,
  PlotlyRenderer,
  D3Renderer,

  // Chart Classes (Fluent API)
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  ComboChart,
  barChart,
  lineChart,
  pieChart,

  // Utilities
  ColorManager,
  ColorPalettes,
  DataSampler,

  // Chart.js
  Chart,
  registerables,

  // Constants
  DEFAULT_CHART_COLORS,
} from '@mindfiredigital/pivothead-analytics';

// Register Chart.js components
Chart.register(...registerables);

// ==================== Sample Data ====================
const sampleData = [
  {
    region: 'North America',
    country: 'USA',
    department: 'Sales',
    quarter: 'Q1',
    revenue: 150000,
    expenses: 45000,
    profit: 105000,
  },
  {
    region: 'North America',
    country: 'USA',
    department: 'Marketing',
    quarter: 'Q1',
    revenue: 120000,
    expenses: 38000,
    profit: 82000,
  },
  {
    region: 'North America',
    country: 'USA',
    department: 'Engineering',
    quarter: 'Q1',
    revenue: 200000,
    expenses: 75000,
    profit: 125000,
  },
  {
    region: 'North America',
    country: 'Canada',
    department: 'Sales',
    quarter: 'Q1',
    revenue: 90000,
    expenses: 30000,
    profit: 60000,
  },
  {
    region: 'Europe',
    country: 'UK',
    department: 'Sales',
    quarter: 'Q1',
    revenue: 140000,
    expenses: 42000,
    profit: 98000,
  },
  {
    region: 'Europe',
    country: 'UK',
    department: 'Marketing',
    quarter: 'Q1',
    revenue: 110000,
    expenses: 35000,
    profit: 75000,
  },
  {
    region: 'Europe',
    country: 'Germany',
    department: 'Engineering',
    quarter: 'Q1',
    revenue: 180000,
    expenses: 65000,
    profit: 115000,
  },
  {
    region: 'Europe',
    country: 'France',
    department: 'Sales',
    quarter: 'Q1',
    revenue: 130000,
    expenses: 40000,
    profit: 90000,
  },
  {
    region: 'Asia',
    country: 'China',
    department: 'Sales',
    quarter: 'Q1',
    revenue: 170000,
    expenses: 50000,
    profit: 120000,
  },
  {
    region: 'Asia',
    country: 'Japan',
    department: 'Engineering',
    quarter: 'Q1',
    revenue: 160000,
    expenses: 55000,
    profit: 105000,
  },
  {
    region: 'Asia',
    country: 'India',
    department: 'Marketing',
    quarter: 'Q1',
    revenue: 100000,
    expenses: 32000,
    profit: 68000,
  },
  {
    region: 'North America',
    country: 'USA',
    department: 'Sales',
    quarter: 'Q2',
    revenue: 165000,
    expenses: 48000,
    profit: 117000,
  },
  {
    region: 'North America',
    country: 'USA',
    department: 'Marketing',
    quarter: 'Q2',
    revenue: 135000,
    expenses: 40000,
    profit: 95000,
  },
  {
    region: 'Europe',
    country: 'UK',
    department: 'Sales',
    quarter: 'Q2',
    revenue: 155000,
    expenses: 45000,
    profit: 110000,
  },
  {
    region: 'Asia',
    country: 'China',
    department: 'Sales',
    quarter: 'Q2',
    revenue: 185000,
    expenses: 55000,
    profit: 130000,
  },
];

// ==================== Initialize PivotEngine ====================
const pivotConfig = {
  data: sampleData,
  rows: [{ uniqueName: 'region', caption: 'Region' }],
  columns: [{ uniqueName: 'department', caption: 'Department' }],
  measures: [
    { uniqueName: 'revenue', caption: 'Revenue', aggregation: 'sum' },
    { uniqueName: 'profit', caption: 'Profit', aggregation: 'sum' },
  ],
};

const engine = new PivotEngine(pivotConfig);

// ==================== Section Navigation ====================
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active nav button
    document
      .querySelectorAll('.nav-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show corresponding section
    const sectionId = btn.dataset.section;
    document
      .querySelectorAll('.demo-section')
      .forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
  });
});

// ==================== 1. Chart Libraries Demo ====================
function initChartLibraries() {
  const chartData = {
    labels: ['Sales', 'Marketing', 'Engineering'],
    datasets: [
      {
        label: 'Revenue',
        data: [150000, 120000, 200000],
        backgroundColor: DEFAULT_CHART_COLORS.slice(0, 3),
      },
    ],
  };

  // Chart.js
  const chartJsRenderer = new ChartJsRenderer();
  chartJsRenderer.render(document.getElementById('chart-chartjs'), chartData, {
    type: 'column',
    style: { title: 'Chart.js Renderer', animated: true },
  });

  // ECharts
  const echartsRenderer = new EChartsRenderer();
  echartsRenderer.render(document.getElementById('chart-echarts'), chartData, {
    type: 'column',
    style: { title: 'ECharts Renderer', animated: true },
  });

  // Plotly
  const plotlyRenderer = new PlotlyRenderer();
  plotlyRenderer.render(document.getElementById('chart-plotly'), chartData, {
    type: 'column',
    style: { title: 'Plotly Renderer' },
  });

  // D3
  const d3Renderer = new D3Renderer();
  d3Renderer.render(document.getElementById('chart-d3'), chartData, {
    type: 'column',
    style: { title: 'D3.js Renderer' },
  });
}

// ==================== 2. Chart Classes (Fluent API) ====================
let fluentChart = null;

function updateFluentChart() {
  const chartType = document.getElementById('chart-class-type').value;
  const isStacked = document.getElementById('chart-stacked').checked;
  const isHorizontal = document.getElementById('chart-horizontal').checked;
  const isAnimated = document.getElementById('chart-animated').checked;

  const container = document.getElementById('chart-fluent');
  container.innerHTML = '';

  let chartConfig;
  let codeExample = '';

  const chartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Revenue', data: [150, 180, 160, 200] },
      { label: 'Profit', data: [80, 100, 90, 120] },
    ],
  };

  switch (chartType) {
    case 'bar':
      chartConfig = new BarChart()
        .title('Sales Performance')
        .colorScheme('tableau10')
        .legend(true, 'top');
      if (isStacked) chartConfig.asStacked();
      if (isHorizontal) chartConfig.asHorizontal();
      if (!isAnimated) chartConfig.animate(false);

      codeExample = `const chart = new BarChart()
  .title('Sales Performance')
  .colorScheme('tableau10')
  .legend(true, 'top')${isStacked ? '\n  .asStacked()' : ''}${isHorizontal ? '\n  .asHorizontal()' : ''}${!isAnimated ? '\n  .animate(false)' : ''};`;
      break;

    case 'line':
      chartConfig = new LineChart()
        .title('Trend Analysis')
        .colorScheme('category10')
        .smooth(0.4);
      if (isStacked) chartConfig.asStacked().asArea();
      if (!isAnimated) chartConfig.animate(false);

      codeExample = `const chart = new LineChart()
  .title('Trend Analysis')
  .colorScheme('category10')
  .smooth(0.4)${isStacked ? '\n  .asStacked().asArea()' : ''}${!isAnimated ? '\n  .animate(false)' : ''};`;
      break;

    case 'pie':
      chartConfig = new PieChart()
        .title('Revenue Distribution')
        .colorScheme('pastel')
        .showPercentages(true);
      if (!isAnimated) chartConfig.animate(false);

      codeExample = `const chart = new PieChart()
  .title('Revenue Distribution')
  .colorScheme('pastel')
  .showPercentages(true)${!isAnimated ? '\n  .animate(false)' : ''};`;

      // Aggregate data for pie
      chartData.datasets = [
        {
          label: 'Revenue',
          data: [150, 180, 160, 200],
        },
      ];
      break;

    case 'scatter':
      chartConfig = new ScatterChart()
        .title('Correlation Analysis')
        .colorScheme('dark')
        .pointSize(8)
        .showTrendLine();

      codeExample = `const chart = new ScatterChart()
  .title('Correlation Analysis')
  .colorScheme('dark')
  .pointSize(8)
  .showTrendLine();`;

      // Convert to scatter data
      chartData.datasets = [
        {
          label: 'Data Points',
          data: [
            { x: 10, y: 20 },
            { x: 15, y: 25 },
            { x: 20, y: 30 },
            { x: 25, y: 35 },
            { x: 30, y: 45 },
            { x: 35, y: 40 },
          ],
        },
      ];
      break;

    case 'heatmap':
      chartConfig = new HeatmapChart()
        .title('Performance Matrix')
        .blueScale()
        .showCellValues(true);

      codeExample = `const chart = new HeatmapChart()
  .title('Performance Matrix')
  .blueScale()
  .showCellValues(true);`;
      break;

    case 'combo':
      chartConfig = new ComboChart()
        .title('Revenue vs Trend')
        .primaryBar()
        .secondaryLine()
        .useDualAxis();

      codeExample = `const chart = new ComboChart()
  .title('Revenue vs Trend')
  .primaryBar()
  .secondaryLine()
  .useDualAxis();`;
      break;
  }

  document.getElementById('fluent-code').textContent = codeExample;

  // Render using ChartJsRenderer
  const renderer = new ChartJsRenderer();
  const options = chartConfig.getRenderOptions();

  fluentChart = renderer.render(container, chartData, options);
}

document
  .getElementById('chart-class-type')
  .addEventListener('change', updateFluentChart);
document
  .getElementById('chart-stacked')
  .addEventListener('change', updateFluentChart);
document
  .getElementById('chart-horizontal')
  .addEventListener('change', updateFluentChart);
document
  .getElementById('chart-animated')
  .addEventListener('change', updateFluentChart);

// ==================== 3. All Chart Types ====================
function initAllChartTypes() {
  const renderer = new ChartJsRenderer();
  const echartsRenderer = new EChartsRenderer();

  const basicData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [150, 180, 160, 200],
        backgroundColor: DEFAULT_CHART_COLORS[0],
      },
      {
        label: 'Profit',
        data: [80, 100, 90, 120],
        backgroundColor: DEFAULT_CHART_COLORS[1],
      },
    ],
  };

  // Column Chart
  renderer.render(document.getElementById('type-column'), basicData, {
    type: 'column',
  });

  // Bar Chart (Horizontal)
  renderer.render(document.getElementById('type-bar'), basicData, {
    type: 'bar',
    style: { orientation: 'horizontal' },
  });

  // Line Chart
  renderer.render(document.getElementById('type-line'), basicData, {
    type: 'line',
  });

  // Area Chart
  renderer.render(document.getElementById('type-area'), basicData, {
    type: 'area',
  });

  // Stacked Column
  renderer.render(document.getElementById('type-stacked-column'), basicData, {
    type: 'stackedColumn',
  });

  // Stacked Area
  renderer.render(document.getElementById('type-stacked-area'), basicData, {
    type: 'stackedArea',
  });

  // Pie Chart
  const pieData = {
    labels: ['Sales', 'Marketing', 'Engineering', 'Support'],
    datasets: [{ data: [35, 25, 30, 10] }],
  };
  renderer.render(document.getElementById('type-pie'), pieData, {
    type: 'pie',
  });

  // Doughnut Chart
  renderer.render(document.getElementById('type-doughnut'), pieData, {
    type: 'doughnut',
  });

  // Scatter Chart
  const scatterData = {
    datasets: [
      {
        label: 'Data Points',
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 35 },
          { x: 20, y: 25 },
          { x: 25, y: 45 },
          { x: 30, y: 35 },
          { x: 35, y: 55 },
        ],
      },
    ],
  };
  renderer.render(document.getElementById('type-scatter'), scatterData, {
    type: 'scatter',
  });

  // Heatmap (using ECharts for better support)
  const heatmapData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      { label: 'Week 1', data: [10, 20, 30, 40, 50] },
      { label: 'Week 2', data: [15, 25, 35, 45, 55] },
      { label: 'Week 3', data: [20, 30, 40, 50, 60] },
    ],
    cells: [
      { x: 0, y: 0, value: 10 },
      { x: 1, y: 0, value: 20 },
      { x: 2, y: 0, value: 30 },
      { x: 0, y: 1, value: 15 },
      { x: 1, y: 1, value: 25 },
      { x: 2, y: 1, value: 35 },
      { x: 0, y: 2, value: 20 },
      { x: 1, y: 2, value: 30 },
      { x: 2, y: 2, value: 40 },
    ],
  };
  echartsRenderer.render(document.getElementById('type-heatmap'), heatmapData, {
    type: 'heatmap',
  });

  // Combo Chart
  const comboData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Revenue', data: [150, 180, 160, 200], type: 'bar' },
      { label: 'Trend', data: [140, 170, 175, 190], type: 'line' },
    ],
  };
  renderer.render(document.getElementById('type-combo'), comboData, {
    type: 'comboBarLine',
  });

  // Treemap (using ECharts)
  const treemapData = {
    tree: [
      {
        name: 'Sales',
        value: 150,
        children: [
          { name: 'Direct', value: 80 },
          { name: 'Online', value: 70 },
        ],
      },
      { name: 'Marketing', value: 100 },
      { name: 'Engineering', value: 120 },
    ],
  };
  echartsRenderer.render(document.getElementById('type-treemap'), treemapData, {
    type: 'treemap',
  });
}

// ==================== 4. Chart Recommendations ====================
function getRecommendations() {
  const scenario = document.getElementById('recommendation-scenario').value;

  let data, fields;

  switch (scenario) {
    case 'single-category':
      data = [
        { category: 'A', value: 30 },
        { category: 'B', value: 25 },
        { category: 'C', value: 20 },
        { category: 'D', value: 15 },
        { category: 'E', value: 10 },
      ];
      fields = { rows: ['category'], columns: [], measures: ['value'] };
      break;

    case 'multi-category':
      data = sampleData;
      fields = {
        rows: ['region'],
        columns: ['department'],
        measures: ['revenue', 'profit'],
      };
      break;

    case 'time-series':
      data = [
        { date: '2024-01', value: 100 },
        { date: '2024-02', value: 120 },
        { date: '2024-03', value: 115 },
        { date: '2024-04', value: 140 },
        { date: '2024-05', value: 135 },
        { date: '2024-06', value: 160 },
      ];
      fields = { rows: ['date'], columns: [], measures: ['value'] };
      break;

    case 'comparison':
      data = sampleData;
      fields = {
        rows: ['region', 'country'],
        columns: ['department'],
        measures: ['revenue'],
      };
      break;

    case 'hierarchical':
      data = sampleData;
      fields = {
        rows: ['region', 'country', 'department'],
        columns: [],
        measures: ['revenue'],
      };
      break;

    case 'correlation':
      data = sampleData;
      fields = {
        rows: ['department'],
        columns: [],
        measures: ['revenue', 'profit', 'expenses'],
      };
      break;
  }

  // Profile the data
  const profile = ChartRecommender.profileData(data, fields);

  // Get recommendations
  const recommendations = ChartRecommender.recommend(profile);

  // Display profile
  document.getElementById('profile-details').textContent = JSON.stringify(
    {
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      measureCount: profile.measureCount,
      hasTimeField: profile.hasTimeField,
      hasHierarchy: profile.hasHierarchy,
      cardinality: profile.cardinality,
      totalDataPoints: profile.totalDataPoints,
    },
    null,
    2
  );

  // Display recommendations
  const listEl = document.getElementById('recommendation-items');
  listEl.innerHTML = recommendations
    .slice(0, 5)
    .map(
      rec => `
    <li>
      <span class="recommendation-type">${rec.type}</span>
      <span class="recommendation-score">${(rec.score * 100).toFixed(0)}%</span>
      <span class="recommendation-reason">${rec.reason}</span>
    </li>
  `
    )
    .join('');

  // Render the best recommendation
  if (recommendations.length > 0) {
    const best = recommendations[0];
    const chartEngine = new ChartEngine(engine);

    document.getElementById('chart-recommended').innerHTML = '';

    // Use appropriate chart type
    const renderer = new ChartJsRenderer();
    const chartData = {
      labels: [...new Set(data.map(d => d[fields.rows[0]]))],
      datasets: fields.measures.map((m, i) => ({
        label: m,
        data: [...new Set(data.map(d => d[fields.rows[0]]))].map(label =>
          data
            .filter(d => d[fields.rows[0]] === label)
            .reduce((sum, d) => sum + (d[m] || 0), 0)
        ),
        backgroundColor: DEFAULT_CHART_COLORS[i],
      })),
    };

    renderer.render(document.getElementById('chart-recommended'), chartData, {
      type: best.type,
      style: { title: `Recommended: ${best.type}` },
    });
  }
}

document
  .getElementById('btn-recommend')
  .addEventListener('click', getRecommendations);
document
  .getElementById('recommendation-scenario')
  .addEventListener('change', getRecommendations);

// ==================== 5. Data Sampling ====================
function applySampling() {
  const datasetSize = parseInt(document.getElementById('dataset-size').value);
  const method = document.getElementById('sampling-method').value;
  const targetSize = parseInt(document.getElementById('sample-size').value);

  // Generate large dataset
  const originalData = [];
  for (let i = 0; i < datasetSize; i++) {
    originalData.push({
      x: i,
      y: Math.sin(i / 50) * 50 + Math.random() * 20 + 50,
    });
  }

  // Create sampler
  const sampler = new DataSampler({
    maxDataPoints: targetSize,
    samplingMethod: method,
  });

  // Sample the data
  const startTime = performance.now();
  const sampledData = sampler.sample(originalData, targetSize);
  const endTime = performance.now();

  // Update stats
  document.getElementById('stat-original').textContent =
    datasetSize.toLocaleString();
  document.getElementById('stat-sampled').textContent =
    sampledData.length.toLocaleString();
  document.getElementById('stat-reduction').textContent =
    `${((1 - sampledData.length / datasetSize) * 100).toFixed(1)}%`;
  document.getElementById('stat-time').textContent =
    `${(endTime - startTime).toFixed(2)}ms`;

  // Render original (limited to 500 for performance)
  const renderer = new ChartJsRenderer();
  const originalDisplay = originalData.slice(0, 500);

  document.getElementById('chart-original').innerHTML = '';
  renderer.render(
    document.getElementById('chart-original'),
    {
      datasets: [
        {
          label: 'Original Data',
          data: originalDisplay,
          borderColor: DEFAULT_CHART_COLORS[0],
          backgroundColor: 'transparent',
          pointRadius: 1,
        },
      ],
    },
    { type: 'scatter', style: { showLegend: false } }
  );

  // Render sampled
  document.getElementById('chart-sampled').innerHTML = '';
  renderer.render(
    document.getElementById('chart-sampled'),
    {
      datasets: [
        {
          label: 'Sampled Data',
          data: sampledData,
          borderColor: DEFAULT_CHART_COLORS[1],
          backgroundColor: 'transparent',
          pointRadius: 2,
        },
      ],
    },
    { type: 'scatter', style: { showLegend: false } }
  );
}

document.getElementById('btn-sample').addEventListener('click', applySampling);

// ==================== 6. Drill-Down Navigation ====================
let drillDownManager;
let drillDownChart;

function initDrillDown() {
  drillDownManager = new DrillDownManager({
    enabled: true,
    levels: ['region', 'country', 'department'],
    onDrill: (level, path) => {
      console.log('Drill event:', level, path);
      updateDrillDownUI();
      renderDrillDownChart();
    },
  });

  updateDrillDownUI();
  renderDrillDownChart();
}

function updateDrillDownUI() {
  const level = drillDownManager.getCurrentLevel();
  const path = drillDownManager.getPath();

  document.getElementById('drill-level').textContent = level;
  document.getElementById('drill-breadcrumb').textContent =
    path.length > 0
      ? path.map(p => `${p.field}: ${p.value}`).join(' > ')
      : 'All Data';

  const filter = drillDownManager.getCurrentFilter();
  document.getElementById('drill-filter').textContent =
    Object.keys(filter).length > 0 ? JSON.stringify(filter) : 'None';

  document.getElementById('btn-drill-up').disabled =
    !drillDownManager.canDrillUp();
}

function renderDrillDownChart() {
  const filter = drillDownManager.getCurrentFilter();
  const level = drillDownManager.getCurrentLevel();
  const levels = ['region', 'country', 'department'];
  const currentField = levels[level] || 'region';

  // Filter data based on drill path
  let filteredData = sampleData;
  Object.entries(filter).forEach(([key, value]) => {
    filteredData = filteredData.filter(d => d[key] === value);
  });

  // Aggregate by current level
  const aggregated = {};
  filteredData.forEach(d => {
    const key = d[currentField];
    if (!aggregated[key]) aggregated[key] = 0;
    aggregated[key] += d.revenue;
  });

  const chartData = {
    labels: Object.keys(aggregated),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(aggregated),
        backgroundColor: DEFAULT_CHART_COLORS.slice(
          0,
          Object.keys(aggregated).length
        ),
      },
    ],
  };

  // Clear and render
  document.getElementById('chart-drilldown').innerHTML = '';

  const renderer = new ChartJsRenderer();
  drillDownChart = renderer.render(
    document.getElementById('chart-drilldown'),
    chartData,
    {
      type: 'column',
      style: { title: `Revenue by ${currentField}` },
      interactions: {
        click: clickData => {
          console.log('Chart clicked:', clickData);
          if (drillDownManager.canDrillDown()) {
            drillDownManager.drillDown(clickData.rowValue);
          }
        },
      },
    }
  );
}

document.getElementById('btn-drill-up').addEventListener('click', () => {
  drillDownManager.drillUp();
});

document.getElementById('btn-drill-reset').addEventListener('click', () => {
  drillDownManager.reset();
});

// ==================== 7. Data Transformer ====================
function initTransformer() {
  const originalData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Revenue', data: [150, 180, 160, 200] },
      { label: 'Profit', data: [80, 100, 90, 120] },
      { label: 'Expenses', data: [70, 80, 70, 80] },
    ],
    rowFieldName: 'Quarter',
    columnFieldName: 'Metric',
    measures: [{ uniqueName: 'value', caption: 'Value' }],
    selectedMeasure: { uniqueName: 'value', caption: 'Value' },
    allRowValues: ['Q1', 'Q2', 'Q3', 'Q4'],
    allColumnValues: ['Revenue', 'Profit', 'Expenses'],
    filteredRowValues: ['Q1', 'Q2', 'Q3', 'Q4'],
    filteredColumnValues: ['Revenue', 'Profit', 'Expenses'],
  };

  const renderer = new ChartJsRenderer();

  // Render original
  document.getElementById('chart-transform-original').innerHTML = '';
  renderer.render(
    document.getElementById('chart-transform-original'),
    originalData,
    { type: 'column', style: { title: 'Original Data' } }
  );

  return originalData;
}

let transformOriginalData;

function applyTransform() {
  const transformType = document.getElementById('transform-type').value;

  if (!transformOriginalData) {
    transformOriginalData = initTransformer();
  }

  let transformedData;
  let previewText = '';

  switch (transformType) {
    case 'aggregate':
      transformedData = DataTransformer.aggregate(transformOriginalData, 'sum');
      previewText = 'Aggregated all datasets into a single dataset (sum)';
      break;

    case 'transpose':
      transformedData = DataTransformer.transpose(transformOriginalData);
      previewText = 'Swapped rows and columns';
      break;

    case 'normalize':
      transformedData = DataTransformer.normalize(
        transformOriginalData,
        'column'
      );
      previewText = 'Normalized values to percentages (0-100%)';
      break;

    case 'stacked':
      transformedData = DataTransformer.toStacked(transformOriginalData);
      previewText = 'Converted to stacked format';
      break;

    case 'heatmap':
      transformedData = DataTransformer.toHeatmap(transformOriginalData);
      previewText = 'Converted to heatmap cells format';
      break;

    case 'limit':
      transformedData = DataTransformer.applyLimit(
        transformOriginalData,
        2,
        'value',
        'desc'
      );
      previewText = 'Limited to top 2 values';
      break;
  }

  // Render transformed
  const renderer =
    transformType === 'heatmap' ? new EChartsRenderer() : new ChartJsRenderer();
  const chartType =
    transformType === 'heatmap'
      ? 'heatmap'
      : transformType === 'stacked'
        ? 'stackedColumn'
        : 'column';

  document.getElementById('chart-transform-result').innerHTML = '';
  renderer.render(
    document.getElementById('chart-transform-result'),
    transformedData,
    { type: chartType, style: { title: 'Transformed Data' } }
  );

  // Show preview
  document.getElementById('transform-data-preview').textContent =
    previewText +
    '\n\n' +
    JSON.stringify(
      {
        labels: transformedData.labels?.slice(0, 5),
        datasetCount: transformedData.datasets?.length || 0,
        cellCount: transformedData.cells?.length || 0,
      },
      null,
      2
    );
}

document
  .getElementById('btn-transform')
  .addEventListener('click', applyTransform);

// ==================== 8. Color Palettes ====================
function updateColorPalette() {
  const paletteName = document.getElementById('color-palette').value;
  const valueFormat = document.getElementById('value-format').value;

  const colorManager = new ColorManager(paletteName);
  const colors = colorManager.getAllColors();

  // Display color swatches
  const swatchesEl = document.getElementById('palette-colors');
  swatchesEl.innerHTML = colors
    .slice(0, 10)
    .map(
      color => `
    <div class="color-swatch" style="background-color: ${color}" data-color="${color}"></div>
  `
    )
    .join('');

  // Render chart with palette
  const chartData = {
    labels: ['Sales', 'Marketing', 'Engineering', 'Support', 'HR'],
    datasets: [
      {
        label: 'Budget',
        data: [150000, 120000, 200000, 80000, 60000],
        backgroundColor: colors.slice(0, 5),
      },
    ],
  };

  const formatConfig = {
    valueFormat: valueFormat,
    decimals: valueFormat === 'percent' ? 1 : 0,
    currency: 'USD',
  };

  document.getElementById('chart-styled').innerHTML = '';

  const renderer = new ChartJsRenderer();
  renderer.render(document.getElementById('chart-styled'), chartData, {
    type: 'column',
    style: {
      title: `${paletteName} Palette`,
      colorScheme: paletteName,
      showValues: true,
    },
    format: formatConfig,
    interactions: {
      click: data => {
        console.log('Clicked:', data);
        alert(`Clicked: ${data.rowValue}\nValue: ${data.value}`);
      },
    },
  });
}

document
  .getElementById('color-palette')
  .addEventListener('change', updateColorPalette);
document
  .getElementById('value-format')
  .addEventListener('change', updateColorPalette);

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing PivotHead Analytics Demo...');

  // Initialize all sections
  initChartLibraries();
  updateFluentChart();
  initAllChartTypes();
  getRecommendations();
  applySampling();
  initDrillDown();
  transformOriginalData = initTransformer();
  updateColorPalette();

  console.log('Demo initialized successfully!');
  console.log('Available features:');
  console.log('- Multiple chart libraries (Chart.js, ECharts, Plotly, D3)');
  console.log('- Fluent API chart classes');
  console.log('- All chart types');
  console.log('- Smart recommendations');
  console.log('- Data sampling');
  console.log('- Drill-down navigation');
  console.log('- Data transformation');
  console.log('- Color palettes');
});
