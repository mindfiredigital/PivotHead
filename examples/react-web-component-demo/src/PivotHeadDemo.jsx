import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';
import { data, options } from './config/config';

// Register Chart.js components
Chart.register(...registerables);

// Professional color palette
const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  chartColors: [
    'rgba(37, 99, 235, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(20, 184, 166, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(34, 197, 94, 0.8)',
  ]
};

const chartBorderColors = colors.chartColors.map(c => c.replace('0.8)', '1)'));

// Styles
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: colors.background,
    minHeight: '100vh',
  },
  header: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    color: 'white',
    padding: '24px 32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    margin: '8px 0 0 0',
    opacity: 0.9,
    fontSize: '14px',
    fontWeight: '400',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    borderBottom: `2px solid ${colors.border}`,
    paddingBottom: '0',
  },
  tab: {
    padding: '14px 28px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: colors.textSecondary,
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabActive: {
    color: colors.primary,
    borderBottomColor: colors.primary,
    background: 'rgba(37, 99, 235, 0.05)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardBody: {
    padding: '20px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: colors.border,
    color: colors.text,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    color: 'white',
  },
  buttonSuccess: {
    backgroundColor: colors.success,
    color: 'white',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: 'pointer',
    minWidth: '180px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    backgroundColor: colors.surface,
    color: colors.text,
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: colors.background,
    borderRadius: '10px',
    padding: '16px 20px',
    border: `1px solid ${colors.border}`,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '14px 16px',
    backgroundColor: colors.background,
    borderBottom: `2px solid ${colors.border}`,
    textAlign: 'left',
    fontWeight: '600',
    color: colors.text,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  td: {
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
  },
  chartTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '20px',
  },
  chartTypeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    borderRadius: '10px',
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.surface,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chartTypeCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
  },
  chartTypeIcon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  chartTypeLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: '1.2',
  },
  chartTypeLabelActive: {
    color: colors.primary,
  },
};

// SVG Chart Icons
const ChartIcons = {
  column: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="4" height="10" rx="1" fill={color} />
      <rect x="10" y="6" width="4" height="14" rx="1" fill={color} opacity="0.7" />
      <rect x="16" y="3" width="4" height="17" rx="1" fill={color} opacity="0.5" />
    </svg>
  ),
  bar: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="12" height="4" rx="1" fill={color} />
      <rect x="4" y="10" width="16" height="4" rx="1" fill={color} opacity="0.7" />
      <rect x="4" y="16" width="8" height="4" rx="1" fill={color} opacity="0.5" />
    </svg>
  ),
  line: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 18L9 12L13 15L20 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="18" r="2" fill={color} />
      <circle cx="9" cy="12" r="2" fill={color} />
      <circle cx="13" cy="15" r="2" fill={color} />
      <circle cx="20" cy="6" r="2" fill={color} />
    </svg>
  ),
  area: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 18L9 12L13 15L20 6V18H4Z" fill={color} opacity="0.3" />
      <path d="M4 18L9 12L13 15L20 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pie: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" fill={color} opacity="0.3" />
      <path d="M12 4C16.4183 4 20 7.58172 20 12H12V4Z" fill={color} />
      <path d="M12 12L12 4C7.58172 4 4 7.58172 4 12C4 14.5 5.2 16.7 7 18.2L12 12Z" fill={color} opacity="0.6" />
    </svg>
  ),
  doughnut: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="4" opacity="0.3" />
      <path d="M12 4C16.4183 4 20 7.58172 20 12" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M4 12C4 7.58172 7.58172 4 12 4" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  stackedColumn: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="14" width="4" height="6" rx="0.5" fill={color} />
      <rect x="4" y="8" width="4" height="5" rx="0.5" fill={color} opacity="0.5" />
      <rect x="10" y="10" width="4" height="10" rx="0.5" fill={color} />
      <rect x="10" y="4" width="4" height="5" rx="0.5" fill={color} opacity="0.5" />
      <rect x="16" y="12" width="4" height="8" rx="0.5" fill={color} />
      <rect x="16" y="6" width="4" height="5" rx="0.5" fill={color} opacity="0.5" />
    </svg>
  ),
  stackedBar: (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="8" height="4" rx="0.5" fill={color} />
      <rect x="13" y="4" width="5" height="4" rx="0.5" fill={color} opacity="0.5" />
      <rect x="4" y="10" width="12" height="4" rx="0.5" fill={color} />
      <rect x="17" y="10" width="3" height="4" rx="0.5" fill={color} opacity="0.5" />
      <rect x="4" y="16" width="6" height="4" rx="0.5" fill={color} />
      <rect x="11" y="16" width="4" height="4" rx="0.5" fill={color} opacity="0.5" />
    </svg>
  ),
};

// Chart type configurations
const chartTypes = [
  { id: 'column', label: 'Column', category: 'basic' },
  { id: 'bar', label: 'Bar', category: 'basic' },
  { id: 'line', label: 'Line', category: 'basic' },
  { id: 'area', label: 'Area', category: 'basic' },
  { id: 'pie', label: 'Pie', category: 'circular' },
  { id: 'doughnut', label: 'Donut', category: 'circular' },
  { id: 'stackedColumn', label: 'Stacked', category: 'stacked' },
  { id: 'stackedBar', label: 'H-Stack', category: 'stacked' },
];

const PivotHeadDemo = () => {
  const pivotRef = useRef(null);
  const chartRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const chartServiceRef = useRef(null);

  const [state, setState] = useState();
  const [activeTab, setActiveTab] = useState('table');
  const [showRawData, setShowRawData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Filter state
  const [field, setField] = useState('product');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');

  // Chart state
  const [chartType, setChartType] = useState('column');
  const [chartFilterOptions, setChartFilterOptions] = useState({
    measures: [],
    rows: [],
    columns: []
  });
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartLimit, setChartLimit] = useState(10);

  useEffect(() => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    customElements.whenDefined('pivot-head').then(() => {
      pivot.data = data;
      pivot.options = options;

      const handleStateChange = (event) => {
        setState(event.detail);
      };

      pivot.addEventListener('stateChange', handleStateChange);

      const interval = setInterval(() => {
        if (typeof pivot.getState === 'function') {
          try {
            const s = pivot.getState();
            setState(s);
            clearInterval(interval);
          } catch {
            // Engine not ready yet
          }
        }
      }, 100);

      return () => {
        pivot.removeEventListener('stateChange', handleStateChange);
        clearInterval(interval);
      };
    });
  }, []);

  // Initialize ChartService
  const initializeChartService = useCallback(() => {
    const pivot = pivotRef.current;
    if (!pivot || !pivot.engine) return;

    try {
      chartServiceRef.current = new ChartService(pivot.engine);
      const filterOptions = chartServiceRef.current.getAvailableFilterOptions();
      setChartFilterOptions(filterOptions);

      if (filterOptions.measures.length > 0) {
        setSelectedMeasure(filterOptions.measures[0].uniqueName);
      }
      setSelectedRows(filterOptions.rows);
      setSelectedColumns(filterOptions.columns);
    } catch (error) {
      console.error('Failed to initialize ChartService:', error);
    }
  }, []);

  // Destroy chart
  const destroyChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, []);

  // Render chart
  const renderChartVisualization = useCallback(() => {
    if (!chartServiceRef.current || !chartCanvasRef.current) return;

    chartServiceRef.current.setFilters({
      selectedMeasure,
      selectedRows,
      selectedColumns,
      limit: chartLimit
    });

    const chartData = chartServiceRef.current.getChartData();
    if (!chartData || !chartData.labels || chartData.labels.length === 0) return;

    destroyChart();

    const ctx = chartCanvasRef.current.getContext('2d');
    const { labels, datasets, rowFieldName, selectedMeasure: measure } = chartData;

    let chartConfig = {};

    switch (chartType) {
      case 'column':
        chartConfig = {
          type: 'bar',
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            },
            scales: { y: { beginAtZero: true, grid: { color: colors.border } }, x: { grid: { display: false } } }
          }
        };
        break;

      case 'bar':
        chartConfig = {
          type: 'bar',
          data: { labels, datasets },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            },
            scales: { x: { beginAtZero: true, grid: { color: colors.border } }, y: { grid: { display: false } } }
          }
        };
        break;

      case 'line':
        chartConfig = {
          type: 'line',
          data: {
            labels,
            datasets: datasets.map((ds, idx) => ({
              ...ds,
              fill: false,
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderColor: chartBorderColors[idx % chartBorderColors.length],
              backgroundColor: colors.chartColors[idx % colors.chartColors.length]
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Trend`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            },
            scales: { y: { beginAtZero: true, grid: { color: colors.border } }, x: { grid: { display: false } } }
          }
        };
        break;

      case 'area':
        chartConfig = {
          type: 'line',
          data: {
            labels,
            datasets: datasets.map((ds, idx) => ({
              ...ds,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              borderColor: chartBorderColors[idx % chartBorderColors.length],
              backgroundColor: colors.chartColors[idx % colors.chartColors.length].replace('0.8)', '0.3)')
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Area`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            },
            scales: { y: { beginAtZero: true, grid: { color: colors.border } }, x: { grid: { display: false } } }
          }
        };
        break;

      case 'pie':
        const pieData = labels.map((_, idx) => datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0));
        chartConfig = {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: pieData,
              backgroundColor: colors.chartColors.slice(0, labels.length),
              borderColor: chartBorderColors.slice(0, labels.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution`, font: { size: 16, weight: '600' } },
              legend: { position: 'right', labels: { padding: 15, usePointStyle: true } }
            }
          }
        };
        break;

      case 'doughnut':
        const doughnutData = labels.map((_, idx) => datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0));
        chartConfig = {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: doughnutData,
              backgroundColor: colors.chartColors.slice(0, labels.length),
              borderColor: chartBorderColors.slice(0, labels.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution`, font: { size: 16, weight: '600' } },
              legend: { position: 'right', labels: { padding: 15, usePointStyle: true } }
            }
          }
        };
        break;

      case 'stackedColumn':
        chartConfig = {
          type: 'bar',
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: colors.border } } },
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Stacked`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            }
          }
        };
        break;

      case 'stackedBar':
        chartConfig = {
          type: 'bar',
          data: { labels, datasets },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true, grid: { color: colors.border } }, y: { stacked: true, grid: { display: false } } },
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Stacked`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            }
          }
        };
        break;

      default:
        chartConfig = {
          type: 'bar',
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}`, font: { size: 16, weight: '600' } },
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            }
          }
        };
    }

    chartRef.current = new Chart(ctx, chartConfig);
  }, [chartType, selectedMeasure, selectedRows, selectedColumns, chartLimit, destroyChart]);

  // Initialize chart service when state changes
  useEffect(() => {
    if (state && state.data && state.data.length > 0) {
      const timeoutId = setTimeout(() => {
        initializeChartService();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [state, initializeChartService]);

  // Render chart when switching to analytics tab or when filters change
  useEffect(() => {
    if (activeTab === 'analytics' && chartServiceRef.current) {
      const timeoutId = setTimeout(() => {
        renderChartVisualization();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, chartType, renderChartVisualization]);

  const handleFilter = () => {
    const pivot = pivotRef.current;
    if (pivot && typeof pivot.applyFiltersWithEvent === 'function') {
      pivot.applyFiltersWithEvent([{ field, operator, value }]);
    }
  };

  const handleReset = () => {
    const pivot = pivotRef.current;
    if (pivot && typeof pivot.refresh === 'function') {
      pivot.refresh();
      setField('product');
      setOperator('equals');
      setValue('');
    }
  };

  const handleUploadCSV = async () => {
    const pivot = pivotRef.current;
    if (pivot && typeof pivot.connectToLocalFile === 'function') {
      try {
        setIsLoading(true);
        setLoadingMessage('Uploading file...');

        const result = await pivot.connectToLocalFile({
          maxFileSize: 1024 * 1024 * 1024,
          onProgress: (progress) => setLoadingMessage(`Processing... ${progress}%`),
        });

        if (result.success) {
          setTimeout(() => {
            if (typeof pivot.getState === 'function') {
              setState(pivot.getState());
              setCurrentPage(1);
              setIsLoading(false);
            }
          }, 500);
        } else {
          setIsLoading(false);
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        setIsLoading(false);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleExport = (format) => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    switch (format) {
      case 'pdf': pivot.exportToPDF?.('pivot-export'); break;
      case 'excel': pivot.exportToExcel?.('pivot-export'); break;
      case 'html': pivot.exportToHTML?.('pivot-export'); break;
    }
  };

  // Render table content
  const renderTableContent = () => {
    if (!state || !state.data || state.data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No Data Available</div>
          <div style={{ fontSize: '14px' }}>Upload a file or check your data source</div>
        </div>
      );
    }

    const columns = Object.keys(state.data[0]);
    const totalRows = state.data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedData = state.data.slice(startIndex, endIndex);

    const numericColumns = columns.filter(col => {
      const sample = state.data.slice(0, 100).map(row => row[col]);
      return sample.some(val => typeof val === 'number' || !isNaN(parseFloat(val)));
    });

    return (
      <>
        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalRows.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Records</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{columns.length}</div>
            <div style={styles.statLabel}>Columns</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{numericColumns.length}</div>
            <div style={styles.statLabel}>Numeric Fields</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{currentPage}/{totalPages}</div>
            <div style={styles.statLabel}>Current Page</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '60px' }}>#</th>
                {columns.map((col, i) => (
                  <th key={i} style={{ ...styles.th, textAlign: numericColumns.includes(col) ? 'right' : 'left' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? colors.surface : colors.background }}>
                  <td style={{ ...styles.td, fontWeight: '500', color: colors.textSecondary }}>{startIndex + rowIdx + 1}</td>
                  {columns.map((col, colIdx) => {
                    const val = row[col];
                    const isNumeric = numericColumns.includes(col);
                    return (
                      <td key={colIdx} style={{ ...styles.td, textAlign: isNumeric ? 'right' : 'left', fontFamily: isNumeric ? 'monospace' : 'inherit' }}>
                        {isNumeric && typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (val ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 0' }}>
          <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Showing {startIndex + 1} - {endIndex} of {totalRows.toLocaleString()} records
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ ...styles.button, ...styles.buttonSecondary, opacity: currentPage === 1 ? 0.5 : 1 }}>First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ ...styles.button, ...styles.buttonSecondary, opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ padding: '10px 16px', color: colors.text, fontWeight: '500' }}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ ...styles.button, ...styles.buttonSecondary, opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ ...styles.button, ...styles.buttonSecondary, opacity: currentPage === totalPages ? 0.5 : 1 }}>Last</button>
          </div>
        </div>
      </>
    );
  };

  // Render analytics content
  const renderAnalyticsContent = () => {
    if (!state || !state.data || state.data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No Data for Visualization</div>
          <div style={{ fontSize: '14px' }}>Upload data in the Table tab first</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Sidebar - Chart Controls */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Chart Settings</h3>
            </div>
            <div style={styles.cardBody}>
              {/* Chart Type Grid */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Chart Type</label>
                <div style={styles.chartTypeGrid}>
                  {chartTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      style={{
                        ...styles.chartTypeCard,
                        ...(chartType === type.id ? styles.chartTypeCardActive : {}),
                      }}
                      onMouseEnter={(e) => {
                        if (chartType !== type.id) {
                          e.currentTarget.style.borderColor = colors.primaryLight;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (chartType !== type.id) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <span style={styles.chartTypeIcon}>{type.icon}</span>
                      <span style={{
                        ...styles.chartTypeLabel,
                        ...(chartType === type.id ? styles.chartTypeLabelActive : {}),
                      }}>
                        {type.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measure */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Measure</label>
                <select value={selectedMeasure} onChange={(e) => setSelectedMeasure(e.target.value)} style={{ ...styles.select, width: '100%' }}>
                  {chartFilterOptions.measures.map((m) => (
                    <option key={m.uniqueName} value={m.uniqueName}>{m.caption || m.uniqueName}</option>
                  ))}
                </select>
              </div>

              {/* Rows */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Rows ({selectedRows.length} selected)</label>
                <select multiple value={selectedRows} onChange={(e) => setSelectedRows(Array.from(e.target.selectedOptions, opt => opt.value))} style={{ ...styles.select, width: '100%', height: '120px' }}>
                  {chartFilterOptions.rows.map((row) => (
                    <option key={row} value={row}>{row}</option>
                  ))}
                </select>
              </div>

              {/* Columns */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Categories ({selectedColumns.length} selected)</label>
                <select multiple value={selectedColumns} onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, opt => opt.value))} style={{ ...styles.select, width: '100%', height: '120px' }}>
                  {chartFilterOptions.columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Limit */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Limit (Top N)</label>
                <select value={chartLimit} onChange={(e) => setChartLimit(parseInt(e.target.value, 10))} style={{ ...styles.select, width: '100%' }}>
                  <option value="0">Show All</option>
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="15">Top 15</option>
                  <option value="20">Top 20</option>
                </select>
              </div>

              {/* Apply Button */}
              <button onClick={renderChartVisualization} style={{ ...styles.button, ...styles.buttonPrimary, width: '100%', justifyContent: 'center' }}>
                Apply Changes
              </button>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div style={styles.chartContainer}>
          <div style={{ height: '500px' }}>
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>PivotHead Analytics</h1>
        <p style={styles.headerSubtitle}>Professional data analysis and visualization platform</p>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Tabs */}
        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('table')} style={{ ...styles.tab, ...(activeTab === 'table' ? styles.tabActive : {}) }}>
            <span>📋</span> Data Table
          </button>
          <button onClick={() => setActiveTab('analytics')} style={{ ...styles.tab, ...(activeTab === 'analytics' ? styles.tabActive : {}) }}>
            <span>📊</span> Analytics
          </button>
        </div>

        {/* Table Tab Content */}
        {activeTab === 'table' && (
          <>
            {/* Toolbar */}
            <div style={{ ...styles.card, marginBottom: '24px' }}>
              <div style={{ ...styles.cardBody, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                {/* Filters */}
                <div>
                  <label style={styles.label}>Field</label>
                  <select value={field} onChange={(e) => setField(e.target.value)} style={styles.select}>
                    <option value="product">Product</option>
                    <option value="region">Region</option>
                    <option value="sales">Sales</option>
                    <option value="quantity">Quantity</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Operator</label>
                  <select value={operator} onChange={(e) => setOperator(e.target.value)} style={styles.select}>
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater">Greater than</option>
                    <option value="less">Less than</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Value</label>
                  <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value..." style={{ ...styles.input, width: '160px' }} />
                </div>
                <button onClick={handleFilter} style={{ ...styles.button, ...styles.buttonPrimary }}>Apply Filter</button>
                <button onClick={handleReset} style={{ ...styles.button, ...styles.buttonSecondary }}>Reset</button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button onClick={handleUploadCSV} style={{ ...styles.button, ...styles.buttonSuccess }}>
                    Upload File
                  </button>
                  <button onClick={() => handleExport('excel')} style={{ ...styles.button, ...styles.buttonSecondary }}>Export Excel</button>
                  <button onClick={() => handleExport('pdf')} style={{ ...styles.button, ...styles.buttonSecondary }}>Export PDF</button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ ...styles.card, marginBottom: '24px', textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: colors.warning }}>{loadingMessage}</div>
              </div>
            )}

            {/* Table Card */}
            <div style={styles.card}>
              <div style={styles.cardBody}>
                {renderTableContent()}
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && renderAnalyticsContent()}
      </main>

      {/* Hidden pivot component */}
      <pivot-head ref={pivotRef} style={{ display: 'none' }}></pivot-head>
    </div>
  );
};

export default PivotHeadDemo;
