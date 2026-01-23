import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';
import { data, options } from './config/config';

// Register Chart.js components
Chart.register(...registerables);

// Color palette for charts
const chartColors = [
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 99, 132, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(46, 204, 113, 0.8)',
  'rgba(231, 76, 60, 0.8)',
];

const chartBorderColors = chartColors.map(c => c.replace('0.8)', '1)'));

const PivotHeadDemo = () => {
  const pivotRef = useRef(null);
  const chartRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const chartServiceRef = useRef(null);

  const [activeTab, setActiveTab] = useState('table');
  const [chartType, setChartType] = useState('column');
  const [chartFilterOptions, setChartFilterOptions] = useState({
    measures: [],
    rows: [],
    columns: []
  });
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [selectedLimit, setSelectedLimit] = useState(5);
  const [engineReady, setEngineReady] = useState(false);

  // Initialize pivot component
  useEffect(() => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    customElements.whenDefined('pivot-head').then(() => {
      pivot.data = data;
      pivot.options = options;

      // Wait for engine to be ready
      const interval = setInterval(() => {
        if (pivot.pivotEngine) {
          setEngineReady(true);
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    });
  }, []);

  // Initialize ChartService when engine is ready
  const initializeChartService = useCallback(() => {
    const pivot = pivotRef.current;
    if (!pivot || !pivot.pivotEngine) return;

    try {
      chartServiceRef.current = new ChartService(pivot.pivotEngine);
      const filterOptions = chartServiceRef.current.getAvailableFilterOptions();
      setChartFilterOptions(filterOptions);

      if (filterOptions.measures.length > 0) {
        setSelectedMeasure(filterOptions.measures[0].uniqueName);
      }
    } catch (error) {
      console.error('Failed to initialize ChartService:', error);
    }
  }, []);

  useEffect(() => {
    if (engineReady) {
      initializeChartService();
    }
  }, [engineReady, initializeChartService]);

  // Destroy chart
  const destroyChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, []);

  // Render chart
  const renderChart = useCallback(() => {
    if (!chartServiceRef.current || !chartCanvasRef.current) return;

    chartServiceRef.current.setFilters({
      selectedMeasure,
      limit: selectedLimit
    });

    const chartData = chartServiceRef.current.getChartData();
    if (!chartData || !chartData.labels || chartData.labels.length === 0) return;

    destroyChart();

    const ctx = chartCanvasRef.current.getContext('2d');
    const { labels, datasets, rowFieldName, selectedMeasure: measure } = chartData;

    // Apply colors to datasets
    const coloredDatasets = datasets.map((ds, idx) => ({
      ...ds,
      backgroundColor: chartColors[idx % chartColors.length],
      borderColor: chartBorderColors[idx % chartBorderColors.length],
      borderWidth: 1,
    }));

    let config = {};

    switch (chartType) {
      case 'column':
        config = {
          type: 'bar',
          data: { labels, datasets: coloredDatasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}` },
              legend: { position: 'bottom' }
            }
          }
        };
        break;

      case 'bar':
        config = {
          type: 'bar',
          data: { labels, datasets: coloredDatasets },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}` },
              legend: { position: 'bottom' }
            }
          }
        };
        break;

      case 'line':
        config = {
          type: 'line',
          data: {
            labels,
            datasets: coloredDatasets.map(ds => ({
              ...ds,
              fill: false,
              tension: 0.4,
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Trend` },
              legend: { position: 'bottom' }
            }
          }
        };
        break;

      case 'pie':
        const pieData = labels.map((_, idx) =>
          datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0)
        );
        config = {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: pieData,
              backgroundColor: chartColors.slice(0, labels.length),
              borderColor: chartBorderColors.slice(0, labels.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution` },
              legend: { position: 'right' }
            }
          }
        };
        break;

      case 'doughnut':
        const doughnutData = labels.map((_, idx) =>
          datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0)
        );
        config = {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: doughnutData,
              backgroundColor: chartColors.slice(0, labels.length),
              borderColor: chartBorderColors.slice(0, labels.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution` },
              legend: { position: 'right' }
            }
          }
        };
        break;

      default:
        config = {
          type: 'bar',
          data: { labels, datasets: coloredDatasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}` },
              legend: { position: 'bottom' }
            }
          }
        };
    }

    chartRef.current = new Chart(ctx, config);
  }, [chartType, selectedMeasure, selectedLimit, destroyChart]);

  // Render chart when switching to analytics tab
  useEffect(() => {
    if (activeTab === 'analytics' && chartServiceRef.current) {
      setTimeout(() => renderChart(), 100);
    }
  }, [activeTab, chartType, selectedMeasure, selectedLimit, renderChart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyChart();
  }, [destroyChart]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Table Tab */}
      <div style={{ display: activeTab === 'table' ? 'block' : 'none' }}>
        <div style={{ padding: '20px' }}>
          <pivot-head ref={pivotRef}></pivot-head>
        </div>

        {/* Tab Navigation - Bottom Right */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '15px 20px',
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                padding: '10px 24px',
                border: 'none',
                backgroundColor: activeTab === 'table' ? '#1a73e8' : '#f8f9fa',
                color: activeTab === 'table' ? '#fff' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Table
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '10px 24px',
                border: 'none',
                backgroundColor: activeTab === 'analytics' ? '#1a73e8' : '#f8f9fa',
                color: activeTab === 'analytics' ? '#fff' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Tab */}
      <div style={{ display: activeTab === 'analytics' ? 'block' : 'none', padding: '20px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '20px',
        }}>
          {/* Chart Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e8eaed',
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Chart Visualization</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', marginRight: '8px' }}>
                  Chart Type:
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '14px',
                  }}
                >
                  <option value="column">Column Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart Filters */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5f6368', marginBottom: '4px', textTransform: 'uppercase' }}>
                Measure
              </label>
              <select
                value={selectedMeasure}
                onChange={(e) => setSelectedMeasure(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  minWidth: '150px',
                }}
              >
                {chartFilterOptions.measures.map((m) => (
                  <option key={m.uniqueName} value={m.uniqueName}>
                    {m.caption || m.uniqueName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5f6368', marginBottom: '4px', textTransform: 'uppercase' }}>
                Limit
              </label>
              <select
                value={selectedLimit}
                onChange={(e) => setSelectedLimit(parseInt(e.target.value, 10))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  minWidth: '100px',
                }}
              >
                <option value="0">All</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="15">Top 15</option>
                <option value="20">Top 20</option>
              </select>
            </div>

            <button
              onClick={renderChart}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>

          {/* Chart Container */}
          <div style={{ height: '450px', position: 'relative' }}>
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>

        {/* Tab Navigation - Bottom Right */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '15px 0',
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                padding: '10px 24px',
                border: 'none',
                backgroundColor: activeTab === 'table' ? '#1a73e8' : '#f8f9fa',
                color: activeTab === 'table' ? '#fff' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Table
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '10px 24px',
                border: 'none',
                backgroundColor: activeTab === 'analytics' ? '#1a73e8' : '#f8f9fa',
                color: activeTab === 'analytics' ? '#fff' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PivotHeadDemo;
