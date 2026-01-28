import React, { useState } from 'react';
import './InteractiveChartDemo.css';

type ChartCategory = 'basic' | 'circular' | 'stacked' | 'combo' | 'statistical';

interface ChartInfo {
  id: string;
  name: string;
  category: ChartCategory;
  description: string;
  icon: React.ReactNode;
  code: string;
}

const chartTypes: ChartInfo[] = [
  {
    id: 'column',
    name: 'Column Chart',
    category: 'basic',
    description: 'Vertical bars comparing values across categories. Perfect for showing trends over time or comparing quantities.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="20" width="6" height="16" fill="currentColor" opacity="0.9" rx="1" />
        <rect x="12" y="12" width="6" height="24" fill="currentColor" opacity="0.7" rx="1" />
        <rect x="20" y="8" width="6" height="28" fill="currentColor" opacity="0.85" rx="1" />
        <rect x="28" y="16" width="6" height="20" fill="currentColor" opacity="0.75" rx="1" />
      </svg>
    ),
    code: `import { ChartService, Chart, registerables } from '@mindfiredigital/pivothead-analytics';

Chart.register(...registerables);

const chartService = new ChartService(engine);
const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Sales by Region' }
    }
  }
});`,
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    category: 'basic',
    description: 'Horizontal bars ideal for comparing categories with long labels or ranking data.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="4" width="28" height="6" fill="currentColor" opacity="0.9" rx="1" />
        <rect x="4" y="12" width="20" height="6" fill="currentColor" opacity="0.7" rx="1" />
        <rect x="4" y="20" width="32" height="6" fill="currentColor" opacity="0.85" rx="1" />
        <rect x="4" y="28" width="24" height="6" fill="currentColor" opacity="0.75" rx="1" />
      </svg>
    ),
    code: `const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'bar',
  data: chartData,
  options: {
    indexAxis: 'y', // Makes it horizontal
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  }
});`,
  },
  {
    id: 'line',
    name: 'Line Chart',
    category: 'basic',
    description: 'Connect data points to visualize trends and patterns over continuous data like time series.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <polyline
          points="4,32 12,20 20,26 28,12 36,18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="32" r="2.5" fill="currentColor" />
        <circle cx="12" cy="20" r="2.5" fill="currentColor" />
        <circle cx="20" cy="26" r="2.5" fill="currentColor" />
        <circle cx="28" cy="12" r="2.5" fill="currentColor" />
        <circle cx="36" cy="18" r="2.5" fill="currentColor" />
      </svg>
    ),
    code: `const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'line',
  data: {
    ...chartData,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      tension: 0.4, // Smooth curves
      pointRadius: 4
    }))
  },
  options: { responsive: true }
});`,
  },
  {
    id: 'area',
    name: 'Area Chart',
    category: 'basic',
    description: 'Filled line chart emphasizing volume and magnitude of change over time.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M4,36 L4,28 L12,18 L20,24 L28,10 L36,16 L36,36 Z"
          fill="url(#areaGrad)"
        />
        <polyline
          points="4,28 12,18 20,24 28,10 36,16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    code: `const chartData = chartService.getChartData();

new Chart(canvas, {
  type: 'line',
  data: {
    ...chartData,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      fill: true, // Enable area fill
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.4
    }))
  },
  options: { responsive: true }
});`,
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    category: 'circular',
    description: 'Show proportions and percentages of a whole. Best for 3-7 categories.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <circle cx="20" cy="20" r="16" fill="currentColor" opacity="0.3" />
        <path d="M20,20 L20,4 A16,16 0 0,1 35,25 Z" fill="currentColor" opacity="0.9" />
        <path d="M20,20 L35,25 A16,16 0 0,1 12,34 Z" fill="currentColor" opacity="0.7" />
        <path d="M20,20 L12,34 A16,16 0 0,1 20,4 Z" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    code: `// Use aggregated data for pie charts
const pieData = chartService.getAggregatedChartData();

new Chart(canvas, {
  type: 'pie',
  data: pieData,
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => \`\${ctx.label}: \${ctx.parsed}%\`
        }
      }
    }
  }
});`,
  },
  {
    id: 'doughnut',
    name: 'Doughnut Chart',
    category: 'circular',
    description: 'Pie chart with a center cutout. Great for displaying a single metric with breakdown.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.3" />
        <path
          d="M20,4 A16,16 0 0,1 36,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          opacity="0.9"
          strokeLinecap="round"
        />
        <path
          d="M36,20 A16,16 0 0,1 20,36"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          opacity="0.7"
          strokeLinecap="round"
        />
        <path
          d="M20,36 A16,16 0 0,1 4,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          opacity="0.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    code: `const doughnutData = chartService.getAggregatedChartData();

new Chart(canvas, {
  type: 'doughnut',
  data: doughnutData,
  options: {
    responsive: true,
    cutout: '60%', // Center hole size
    plugins: {
      legend: { position: 'bottom' }
    }
  }
});`,
  },
  {
    id: 'stackedColumn',
    name: 'Stacked Column',
    category: 'stacked',
    description: 'Stack multiple series in vertical bars to show part-to-whole relationships.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="24" width="8" height="12" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="4" y="14" width="8" height="10" fill="currentColor" opacity="0.8" rx="1" />
        <rect x="16" y="18" width="8" height="18" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="16" y="6" width="8" height="12" fill="currentColor" opacity="0.8" rx="1" />
        <rect x="28" y="22" width="8" height="14" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="28" y="10" width="8" height="12" fill="currentColor" opacity="0.8" rx="1" />
      </svg>
    ),
    code: `const stackedData = chartService.getStackedChartData();

new Chart(canvas, {
  type: 'bar',
  data: stackedData,
  options: {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      title: { display: true, text: 'Stacked Sales by Category' }
    }
  }
});`,
  },
  {
    id: 'stackedBar',
    name: 'Stacked Bar',
    category: 'stacked',
    description: 'Horizontal stacked bars for comparing compositions across categories.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="4" width="16" height="6" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="20" y="4" width="12" height="6" fill="currentColor" opacity="0.8" rx="1" />
        <rect x="4" y="14" width="20" height="6" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="24" y="14" width="10" height="6" fill="currentColor" opacity="0.8" rx="1" />
        <rect x="4" y="24" width="14" height="6" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="18" y="24" width="16" height="6" fill="currentColor" opacity="0.8" rx="1" />
      </svg>
    ),
    code: `const stackedData = chartService.getStackedChartData();

new Chart(canvas, {
  type: 'bar',
  data: stackedData,
  options: {
    indexAxis: 'y', // Horizontal
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  }
});`,
  },
  {
    id: 'stackedArea',
    name: 'Stacked Area',
    category: 'stacked',
    description: 'Layered areas showing cumulative totals and individual contributions over time.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <path d="M4,36 L4,28 L12,22 L20,26 L28,18 L36,22 L36,36 Z" fill="currentColor" opacity="0.4" />
        <path d="M4,36 L4,32 L12,26 L20,30 L28,24 L36,28 L36,36 Z" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    code: `const stackedData = chartService.getStackedChartData();

new Chart(canvas, {
  type: 'line',
  data: {
    ...stackedData,
    datasets: stackedData.datasets.map((ds, i) => ({
      ...ds,
      fill: i === 0 ? 'origin' : '-1',
      tension: 0.4
    }))
  },
  options: {
    responsive: true,
    scales: { y: { stacked: true } }
  }
});`,
  },
  {
    id: 'comboBarLine',
    name: 'Bar + Line Combo',
    category: 'combo',
    description: 'Combine bars and lines to show different data types together, like sales vs growth rate.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="20" width="6" height="16" fill="currentColor" opacity="0.6" rx="1" />
        <rect x="14" y="14" width="6" height="22" fill="currentColor" opacity="0.6" rx="1" />
        <rect x="24" y="18" width="6" height="18" fill="currentColor" opacity="0.6" rx="1" />
        <polyline
          points="7,16 17,8 27,12 37,6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="2" fill="currentColor" />
        <circle cx="17" cy="8" r="2" fill="currentColor" />
        <circle cx="27" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    code: `const comboData = chartService.getComboChartData();

new Chart(canvas, {
  type: 'bar',
  data: {
    ...comboData,
    datasets: [
      { ...comboData.datasets[0], type: 'bar', order: 2 },
      { ...comboData.datasets[1], type: 'line', order: 1, tension: 0.4 }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { position: 'left' },
      y1: { position: 'right', grid: { drawOnChartArea: false } }
    }
  }
});`,
  },
  {
    id: 'scatter',
    name: 'Scatter Plot',
    category: 'statistical',
    description: 'Plot individual data points to identify correlations and patterns between two variables.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <circle cx="8" cy="28" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="14" cy="20" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="22" cy="24" r="3" fill="currentColor" opacity="0.9" />
        <circle cx="28" cy="14" r="3" fill="currentColor" opacity="0.75" />
        <circle cx="34" cy="10" r="3" fill="currentColor" opacity="0.85" />
        <circle cx="18" cy="32" r="2.5" fill="currentColor" opacity="0.6" />
        <circle cx="32" cy="22" r="2.5" fill="currentColor" opacity="0.65" />
      </svg>
    ),
    code: `const scatterData = chartService.getScatterData();

new Chart(canvas, {
  type: 'scatter',
  data: scatterData,
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => \`(\${ctx.parsed.x}, \${ctx.parsed.y})\`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'X Axis' } },
      y: { title: { display: true, text: 'Y Axis' } }
    }
  }
});`,
  },
  {
    id: 'histogram',
    name: 'Histogram',
    category: 'statistical',
    description: 'Distribution of data values across bins. Essential for understanding data spread.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="2" y="30" width="5" height="6" fill="currentColor" opacity="0.4" rx="0.5" />
        <rect x="8" y="24" width="5" height="12" fill="currentColor" opacity="0.6" rx="0.5" />
        <rect x="14" y="12" width="5" height="24" fill="currentColor" opacity="0.9" rx="0.5" />
        <rect x="20" y="8" width="5" height="28" fill="currentColor" opacity="1" rx="0.5" />
        <rect x="26" y="16" width="5" height="20" fill="currentColor" opacity="0.75" rx="0.5" />
        <rect x="32" y="26" width="5" height="10" fill="currentColor" opacity="0.5" rx="0.5" />
      </svg>
    ),
    code: `const histogramData = chartService.getHistogramData({}, 10); // 10 bins

new Chart(canvas, {
  type: 'bar',
  data: {
    labels: histogramData.binLabels,
    datasets: [{
      label: 'Frequency',
      data: histogramData.binCounts,
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      barPercentage: 1,
      categoryPercentage: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Value Range' } },
      y: { title: { display: true, text: 'Frequency' } }
    }
  }
});`,
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    category: 'statistical',
    description: 'Color-coded matrix showing magnitude of values. Great for spotting patterns in 2D data.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <rect x="4" y="4" width="10" height="10" fill="currentColor" opacity="0.3" rx="1" />
        <rect x="15" y="4" width="10" height="10" fill="currentColor" opacity="0.7" rx="1" />
        <rect x="26" y="4" width="10" height="10" fill="currentColor" opacity="0.5" rx="1" />
        <rect x="4" y="15" width="10" height="10" fill="currentColor" opacity="0.9" rx="1" />
        <rect x="15" y="15" width="10" height="10" fill="currentColor" opacity="0.4" rx="1" />
        <rect x="26" y="15" width="10" height="10" fill="currentColor" opacity="0.8" rx="1" />
        <rect x="4" y="26" width="10" height="10" fill="currentColor" opacity="0.6" rx="1" />
        <rect x="15" y="26" width="10" height="10" fill="currentColor" opacity="1" rx="1" />
        <rect x="26" y="26" width="10" height="10" fill="currentColor" opacity="0.2" rx="1" />
      </svg>
    ),
    code: `const heatmapData = chartService.getHeatmapData();

// Heatmap requires a matrix plugin or custom rendering
// Here's a basic approach using Chart.js matrix:
new Chart(canvas, {
  type: 'matrix',
  data: {
    datasets: [{
      data: heatmapData.cells.map(cell => ({
        x: cell.x,
        y: cell.y,
        v: cell.value
      })),
      backgroundColor: (ctx) => {
        const value = ctx.dataset.data[ctx.dataIndex]?.v || 0;
        const alpha = (value - heatmapData.minValue) /
                      (heatmapData.maxValue - heatmapData.minValue);
        return \`rgba(255, 99, 132, \${alpha})\`;
      }
    }]
  }
});`,
  },
  {
    id: 'funnel',
    name: 'Funnel Chart',
    category: 'statistical',
    description: 'Visualize stages in a process, showing drop-off between stages like sales pipelines.',
    icon: (
      <svg viewBox="0 0 40 40" className="chart-icon">
        <path d="M4,6 L36,6 L32,14 L8,14 Z" fill="currentColor" opacity="0.9" />
        <path d="M8,16 L32,16 L28,24 L12,24 Z" fill="currentColor" opacity="0.7" />
        <path d="M12,26 L28,26 L24,34 L16,34 Z" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    code: `// Funnel charts can be created with horizontal bar chart
const funnelData = chartService.getAggregatedChartData();

// Sort data descending for funnel effect
const sortedData = [...funnelData.datasets[0].data].sort((a, b) => b - a);

new Chart(canvas, {
  type: 'bar',
  data: {
    labels: funnelData.labels,
    datasets: [{
      data: sortedData,
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ]
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  }
});`,
  },
];

const categories: { id: ChartCategory; label: string; color: string }[] = [
  { id: 'basic', label: 'Basic', color: '#3b82f6' },
  { id: 'circular', label: 'Circular', color: '#8b5cf6' },
  { id: 'stacked', label: 'Stacked', color: '#10b981' },
  { id: 'combo', label: 'Combo', color: '#f59e0b' },
  { id: 'statistical', label: 'Statistical', color: '#ef4444' },
];

// Sample data visualizations for each chart type
const ChartPreview: React.FC<{ chartId: string }> = ({ chartId }) => {
  const previewData = {
    column: { values: [65, 85, 45, 75, 55], labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] },
    bar: { values: [85, 65, 75, 55, 45], labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'] },
    line: { values: [30, 50, 40, 70, 55, 80, 65], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    area: { values: [20, 40, 35, 60, 50, 75, 60], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    pie: { values: [35, 25, 20, 20], labels: ['Electronics', 'Clothing', 'Food', 'Other'] },
    doughnut: { values: [40, 30, 20, 10], labels: ['Desktop', 'Mobile', 'Tablet', 'Other'] },
    stackedColumn: { values: [[30, 40, 25], [20, 35, 30], [25, 25, 35]], labels: ['Region A', 'Region B', 'Region C'] },
    stackedBar: { values: [[35, 25], [30, 40], [25, 35]], labels: ['2022', '2023', '2024'] },
    stackedArea: { values: [[20, 30, 25, 35], [15, 25, 20, 30]], labels: ['Q1', 'Q2', 'Q3', 'Q4'] },
    comboBarLine: { bars: [50, 70, 45, 80], line: [30, 55, 40, 65], labels: ['Jan', 'Feb', 'Mar', 'Apr'] },
    scatter: { points: [[10, 20], [25, 45], [40, 35], [55, 60], [70, 50], [85, 75]] },
    histogram: { values: [5, 12, 25, 35, 28, 15, 8], labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70'] },
    heatmap: { grid: [[0.3, 0.7, 0.5], [0.9, 0.4, 0.8], [0.6, 1.0, 0.2]] },
    funnel: { values: [100, 75, 50, 30], labels: ['Visits', 'Leads', 'Prospects', 'Sales'] },
  };

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  const data = previewData[chartId] || previewData.column;

  const renderColumnChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.values.map((v, i) => (
        <g key={i}>
          <rect
            x={20 + i * 35}
            y={100 - v}
            width="25"
            height={v}
            fill={colors[i % colors.length]}
            rx="2"
            className="preview-bar"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          <text x={32 + i * 35} y="115" fontSize="8" textAnchor="middle" fill="var(--ifm-font-color-base)">
            {data.labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );

  const renderBarChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.values.map((v, i) => (
        <g key={i}>
          <rect
            x="50"
            y={10 + i * 22}
            width={v * 1.5}
            height="16"
            fill={colors[i % colors.length]}
            rx="2"
            className="preview-bar-h"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          <text x="45" y={22 + i * 22} fontSize="7" textAnchor="end" fill="var(--ifm-font-color-base)">
            {data.labels[i]?.substring(0, 8)}
          </text>
        </g>
      ))}
    </svg>
  );

  const renderLineChart = () => {
    const points = data.values.map((v, i) => `${20 + i * 25},${100 - v}`).join(' ');
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        <polyline
          points={points}
          fill="none"
          stroke={colors[0]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="preview-line"
        />
        {data.values.map((v, i) => (
          <circle
            key={i}
            cx={20 + i * 25}
            cy={100 - v}
            r="4"
            fill="var(--ifm-background-color)"
            stroke={colors[0]}
            strokeWidth="2"
            className="preview-dot"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </svg>
    );
  };

  const renderAreaChart = () => {
    const points = data.values.map((v, i) => `${20 + i * 25},${100 - v}`).join(' ');
    const areaPath = `M20,100 L${points} L${20 + (data.values.length - 1) * 25},100 Z`;
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaFill)" className="preview-area" />
        <polyline
          points={points}
          fill="none"
          stroke={colors[0]}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.values.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        <g transform="translate(70, 60)">
          {data.values.map((v, i) => {
            const startAngle = (cumulative / total) * 360 - 90;
            cumulative += v;
            const endAngle = (cumulative / total) * 360 - 90;
            const largeArc = (v / total) > 0.5 ? 1 : 0;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const r = 45;
            const x1 = Math.cos(startRad) * r;
            const y1 = Math.sin(startRad) * r;
            const x2 = Math.cos(endRad) * r;
            const y2 = Math.sin(endRad) * r;
            return (
              <path
                key={i}
                d={`M0,0 L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                fill={colors[i % colors.length]}
                className="preview-slice"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            );
          })}
        </g>
        <g transform="translate(140, 30)">
          {data.labels.map((label, i) => (
            <g key={i} transform={`translate(0, ${i * 18})`}>
              <rect width="10" height="10" fill={colors[i % colors.length]} rx="2" />
              <text x="14" y="9" fontSize="8" fill="var(--ifm-font-color-base)">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  const renderDoughnutChart = () => {
    const total = data.values.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        <g transform="translate(70, 60)">
          {data.values.map((v, i) => {
            const startAngle = (cumulative / total) * 360 - 90;
            cumulative += v;
            const endAngle = (cumulative / total) * 360 - 90;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const r = 40;
            const largeArc = (v / total) > 0.5 ? 1 : 0;
            return (
              <circle
                key={i}
                r={r}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="18"
                strokeDasharray={`${(v / total) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                strokeDashoffset={-cumulative / total * 2 * Math.PI * r + (v / total) * 2 * Math.PI * r}
                transform={`rotate(${-90 + (cumulative - v) / total * 360})`}
                className="preview-ring"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            );
          })}
          <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--ifm-font-color-base)">
            {total}%
          </text>
        </g>
      </svg>
    );
  };

  const renderStackedColumnChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.labels.map((label, i) => {
        let y = 100;
        return (
          <g key={i}>
            {data.values.map((stack, j) => {
              const h = stack[i] || 20;
              y -= h;
              return (
                <rect
                  key={j}
                  x={30 + i * 55}
                  y={y}
                  width="40"
                  height={h}
                  fill={colors[j % colors.length]}
                  className="preview-bar"
                  style={{ animationDelay: `${(i * 3 + j) * 80}ms` }}
                />
              );
            })}
            <text x={50 + i * 55} y="115" fontSize="8" textAnchor="middle" fill="var(--ifm-font-color-base)">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const renderStackedBarChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.labels.map((label, i) => {
        let x = 50;
        return (
          <g key={i}>
            {data.values.map((stack, j) => {
              const w = (stack[i] || 30) * 1.8;
              const prevX = x;
              x += w;
              return (
                <rect
                  key={j}
                  x={prevX}
                  y={15 + i * 30}
                  width={w}
                  height="22"
                  fill={colors[j % colors.length]}
                  className="preview-bar-h"
                  style={{ animationDelay: `${(i * 2 + j) * 100}ms` }}
                />
              );
            })}
            <text x="45" y={30 + i * 30} fontSize="8" textAnchor="end" fill="var(--ifm-font-color-base)">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const renderStackedAreaChart = () => {
    const paths = data.values.map((series, idx) => {
      let path = `M20,100 `;
      series.forEach((v, i) => {
        const cumulative = data.values.slice(0, idx + 1).reduce((sum, s) => sum + (s[i] || 0), 0);
        path += `L${20 + i * 50},${100 - cumulative} `;
      });
      path += `L${20 + (series.length - 1) * 50},100 Z`;
      return path;
    });
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        {paths.map((p, i) => (
          <path key={i} d={p} fill={colors[i]} opacity={0.6} className="preview-area" />
        ))}
      </svg>
    );
  };

  const renderComboChart = () => {
    const linePoints = data.line.map((v, i) => `${30 + i * 45},${100 - v}`).join(' ');
    return (
      <svg viewBox="0 0 200 120" className="preview-svg">
        {data.bars.map((v, i) => (
          <rect
            key={i}
            x={15 + i * 45}
            y={100 - v}
            width="30"
            height={v}
            fill={colors[0]}
            opacity="0.7"
            rx="2"
            className="preview-bar"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
        <polyline
          points={linePoints}
          fill="none"
          stroke={colors[1]}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="preview-line"
        />
        {data.line.map((v, i) => (
          <circle
            key={i}
            cx={30 + i * 45}
            cy={100 - v}
            r="4"
            fill="var(--ifm-background-color)"
            stroke={colors[1]}
            strokeWidth="2"
            className="preview-dot"
          />
        ))}
      </svg>
    );
  };

  const renderScatterChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      <line x1="20" y1="100" x2="180" y2="100" stroke="var(--ifm-color-emphasis-300)" strokeWidth="1" />
      <line x1="20" y1="10" x2="20" y2="100" stroke="var(--ifm-color-emphasis-300)" strokeWidth="1" />
      {data.points.map(([x, y], i) => (
        <circle
          key={i}
          cx={20 + x * 1.8}
          cy={100 - y}
          r="5"
          fill={colors[i % colors.length]}
          className="preview-scatter"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </svg>
  );

  const renderHistogramChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.values.map((v, i) => (
        <rect
          key={i}
          x={15 + i * 25}
          y={100 - v * 2.5}
          width="22"
          height={v * 2.5}
          fill={colors[2]}
          className="preview-bar"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </svg>
  );

  const renderHeatmapChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.grid.map((row, i) =>
        row.map((v, j) => (
          <rect
            key={`${i}-${j}`}
            x={40 + j * 40}
            y={15 + i * 32}
            width="35"
            height="28"
            fill={colors[1]}
            opacity={v}
            rx="3"
            className="preview-heatmap"
            style={{ animationDelay: `${(i * 3 + j) * 100}ms` }}
          />
        ))
      )}
    </svg>
  );

  const renderFunnelChart = () => (
    <svg viewBox="0 0 200 120" className="preview-svg">
      {data.values.map((v, i) => {
        const width = (v / 100) * 160;
        const x = (200 - width) / 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={10 + i * 26}
              width={width}
              height="22"
              fill={colors[i % colors.length]}
              rx="3"
              className="preview-bar"
              style={{ animationDelay: `${i * 150}ms` }}
            />
            <text x="100" y={24 + i * 26} fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">
              {data.labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const renderers = {
    column: renderColumnChart,
    bar: renderBarChart,
    line: renderLineChart,
    area: renderAreaChart,
    pie: renderPieChart,
    doughnut: renderDoughnutChart,
    stackedColumn: renderStackedColumnChart,
    stackedBar: renderStackedBarChart,
    stackedArea: renderStackedAreaChart,
    comboBarLine: renderComboChart,
    scatter: renderScatterChart,
    histogram: renderHistogramChart,
    heatmap: renderHeatmapChart,
    funnel: renderFunnelChart,
  };

  return renderers[chartId]?.() || renderColumnChart();
};

export default function InteractiveChartDemo(): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<string>('column');
  const [activeCategory, setActiveCategory] = useState<ChartCategory | 'all'>('all');
  const [copied, setCopied] = useState(false);

  const filteredCharts = activeCategory === 'all'
    ? chartTypes
    : chartTypes.filter(c => c.category === activeCategory);

  const currentChart = chartTypes.find(c => c.id === selectedChart);

  const copyCode = () => {
    if (currentChart) {
      navigator.clipboard.writeText(currentChart.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="interactive-chart-demo">
      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Charts
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={{ '--tab-color': cat.color } as React.CSSProperties}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="chart-grid">
        {filteredCharts.map(chart => (
          <button
            key={chart.id}
            className={`chart-card ${selectedChart === chart.id ? 'selected' : ''}`}
            onClick={() => setSelectedChart(chart.id)}
            style={{ '--card-color': categories.find(c => c.id === chart.category)?.color } as React.CSSProperties}
          >
            <div className="chart-card-icon">{chart.icon}</div>
            <span className="chart-card-name">{chart.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Chart Details */}
      {currentChart && (
        <div className="chart-details">
          <div className="chart-preview-container">
            <div className="preview-header">
              <h3>{currentChart.name}</h3>
              <span
                className="category-badge"
                style={{ backgroundColor: categories.find(c => c.id === currentChart.category)?.color }}
              >
                {categories.find(c => c.id === currentChart.category)?.label}
              </span>
            </div>
            <p className="chart-description">{currentChart.description}</p>
            <div className="chart-preview-box">
              <ChartPreview chartId={currentChart.id} />
            </div>
          </div>

          <div className="chart-code-container">
            <div className="code-header">
              <span>Implementation</span>
              <button className="copy-btn" onClick={copyCode}>
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="code-block">
              <code>{currentChart.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
