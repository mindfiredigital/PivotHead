import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';
import { data as sampleData, options as sampleOptions } from './config/config';
import { logger } from './logger.js';

// Register Chart.js components
Chart.register(...registerables);

// ─── Colour palette ────────────────────────────────────────────────────────────

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
const chartBorderColors = chartColors.map((c) => c.replace('0.8)', '1)'));

// ─── Component ────────────────────────────────────────────────────────────────

const PivotHeadDemo = () => {
  const pivotRef        = useRef(null);
  const chartRef        = useRef(null);
  const chartCanvasRef  = useRef(null);
  const chartServiceRef = useRef(null);
  const enginePollRef   = useRef(null);

  const [activeTab, setActiveTab]           = useState('table');
  const [chartType, setChartType]           = useState('column');
  const [chartFilterOptions, setChartFilterOptions] = useState({ measures: [], rows: [], columns: [] });
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [selectedLimit, setSelectedLimit]   = useState(5);
  const [engineReady, setEngineReady]       = useState(false);

  // CSV upload state
  const [uploadStatus, setUploadStatus]   = useState(null); // null | 'parsing' | 'done' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);   // 0–100
  const [parseStats, setParseStats]       = useState(null);  // { rowCount, colCount, parseTime, method, fileName }
  const [uploadError, setUploadError]     = useState(null);

  // ─── Helper: start polling for pivotEngine ─────────────────────────────────

  const startEnginePoll = useCallback(() => {
    // Clear any running poll
    if (enginePollRef.current) clearInterval(enginePollRef.current);
    setEngineReady(false);
    chartServiceRef.current = null;

    enginePollRef.current = setInterval(() => {
      const pivot = pivotRef.current;
      if (pivot && pivot.pivotEngine) {
        setEngineReady(true);
        clearInterval(enginePollRef.current);
        enginePollRef.current = null;
      }
    }, 100);
  }, []);

  // ─── Initialize pivot component with sample data ───────────────────────────

  useEffect(() => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    customElements.whenDefined('pivot-head').then(() => {
      pivot.data    = sampleData;
      pivot.options = sampleOptions;
      startEnginePoll();
    });

    return () => {
      if (enginePollRef.current) clearInterval(enginePollRef.current);
    };
  }, [startEnginePoll]);

  // ─── Init ChartService when engine is ready ───────────────────────────────

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
      logger.error('Failed to initialize ChartService:', error);
    }
  }, []);

  useEffect(() => {
    if (engineReady) initializeChartService();
  }, [engineReady, initializeChartService]);

  // ─── Chart lifecycle ──────────────────────────────────────────────────────

  const destroyChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, []);

  const renderChart = useCallback(() => {
    if (!chartServiceRef.current || !chartCanvasRef.current) return;

    chartServiceRef.current.setFilters({ selectedMeasure, limit: selectedLimit });
    const chartData = chartServiceRef.current.getChartData();
    if (!chartData || !chartData.labels || chartData.labels.length === 0) return;

    destroyChart();

    const ctx = chartCanvasRef.current.getContext('2d');
    const { labels, datasets, rowFieldName, selectedMeasure: measure } = chartData;

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
              legend: { position: 'bottom' },
            },
          },
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
              legend: { position: 'bottom' },
            },
          },
        };
        break;

      case 'line':
        config = {
          type: 'line',
          data: {
            labels,
            datasets: coloredDatasets.map((ds) => ({ ...ds, fill: false, tension: 0.4 })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Trend` },
              legend: { position: 'bottom' },
            },
          },
        };
        break;

      case 'pie': {
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
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution` },
              legend: { position: 'right' },
            },
          },
        };
        break;
      }

      case 'doughnut': {
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
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} Distribution` },
              legend: { position: 'right' },
            },
          },
        };
        break;
      }

      default:
        config = {
          type: 'bar',
          data: { labels, datasets: coloredDatasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: `${measure?.caption || 'Value'} by ${rowFieldName}` },
              legend: { position: 'bottom' },
            },
          },
        };
    }

    chartRef.current = new Chart(ctx, config);
  }, [chartType, selectedMeasure, selectedLimit, destroyChart]);

  useEffect(() => {
    if (activeTab === 'analytics' && chartServiceRef.current) {
      setTimeout(() => renderChart(), 100);
    }
  }, [activeTab, chartType, selectedMeasure, selectedLimit, renderChart]);

  useEffect(() => () => destroyChart(), [destroyChart]);

  // ─── CSV upload via ConnectService (streaming WASM for large files) ──────────
  //
  // Delegates to pivot-head's built-in connectToLocalCSV() which internally
  // uses ConnectService with 4-tier processing:
  //   < 1 MB  → JavaScript
  //   1–8 MB  → Web Workers
  //   8 MB+   → WASM in-memory
  //   100 MB+ → Streaming WASM (chunked — supports up to 1 GB)
  //
  // This avoids loading the entire file as a JS string, which would OOM
  // for files in the hundreds of MB range.

  const handleUploadCSV = useCallback(async () => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    setUploadStatus('parsing');
    setUploadError(null);
    setParseStats(null);
    setUploadProgress(0);

    try {
      const result = await pivot.connectToLocalCSV({
        maxFileSize: 1024 * 1024 * 1024, // 1 GB
        onProgress: (progress) => setUploadProgress(Math.round(progress)),
        csv: {
          delimiter: ',',
          hasHeader: true,
          skipEmptyLines: true,
          trimValues: true,
        },
      });

      // User cancelled the file picker — reset silently
      if (!result || (!result.success && !result.error)) {
        setUploadStatus(null);
        return;
      }

      if (!result.success) {
        throw new Error(result.error || 'CSV upload failed.');
      }

      destroyChart();
      chartServiceRef.current = null;
      setChartFilterOptions({ measures: [], rows: [], columns: [] });
      setSelectedMeasure('');
      setActiveTab('table');
      startEnginePoll();

      // Map ConnectService performanceMode → display label
      const isWasm =
        result.performanceMode === 'wasm' ||
        result.performanceMode === 'streaming-wasm';

      setParseStats({
        fileName:  result.fileName  || 'uploaded.csv',
        rowCount:  result.recordCount ?? 0,
        colCount:  result.columns?.length ?? 0,
        parseTime: result.parseTime ?? 0,
        method:    isWasm ? 'wasm' : 'js',
        mode:      result.performanceMode || 'standard',
      });
      setUploadStatus('done');
    } catch (err) {
      logger.error('CSV upload failed:', err);
      setUploadError(err.message || 'Failed to upload CSV file.');
      setUploadStatus('error');
    }
  }, [destroyChart, startEnginePoll]);

  // ─── Shared tab switcher buttons ──────────────────────────────────────────

  const TabBar = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px' }}>
      <div style={{
        display: 'flex',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        {['table', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#1a73e8' : '#f8f9fa',
              color: activeTab === tab ? '#fff' : '#5f6368',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const wasmSupported = typeof WebAssembly !== 'undefined';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

      {/* ── Table Tab ─────────────────────────────────────────────────────── */}
      <div style={{ display: activeTab === 'table' ? 'block' : 'none' }}>

        {/* Header bar with upload button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px 8px',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

            {/* Upload button — opens native file picker via ConnectService */}
            <button
              onClick={handleUploadCSV}
              disabled={uploadStatus === 'parsing'}
              title="Upload a CSV file (supports files up to 1 GB via streaming WASM)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: uploadStatus === 'parsing' ? '#ccc' : '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: uploadStatus === 'parsing' ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              {uploadStatus === 'parsing' ? '⏳ Uploading…' : '📂 Upload CSV'}
            </button>

            {/* WASM capability badge */}
            <span
              title={
                wasmSupported
                  ? 'WebAssembly is available — large files (100 MB+) use streaming WASM'
                  : 'WebAssembly unavailable — JavaScript fallback will be used'
              }
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: wasmSupported ? '#e6f4ea' : '#fce8e6',
                color: wasmSupported ? '#137333' : '#c5221f',
                border: `1px solid ${wasmSupported ? '#ceead6' : '#f5c6c2'}`,
              }}
            >
              {wasmSupported ? '⚡ WASM Ready' : '⚠️ JS Fallback'}
            </span>

            {/* Progress bar (shown while uploading) */}
            {uploadStatus === 'parsing' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '160px',
                  height: '8px',
                  backgroundColor: '#e8eaed',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${uploadProgress}%`,
                    backgroundColor: '#1a73e8',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: '#5f6368' }}>
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Parse stats (shown after upload) */}
          {parseStats && uploadStatus === 'done' && (
            <div style={{
              fontSize: '12px',
              color: '#5f6368',
              backgroundColor: '#f1f3f4',
              padding: '6px 12px',
              borderRadius: '6px',
              lineHeight: '1.6',
            }}>
              <strong style={{ color: '#202124' }}>{parseStats.fileName}</strong>
              {' · '}
              {parseStats.rowCount.toLocaleString()} rows · {parseStats.colCount} cols
              {' · '}
              {parseStats.parseTime.toFixed(1)} ms
              {' · '}
              <span style={{
                color: parseStats.method === 'wasm' ? '#137333' : '#e37400',
                fontWeight: '600',
              }}>
                {parseStats.method === 'wasm'
                  ? `⚡ WASM (${parseStats.mode})`
                  : '📜 JS'}
              </span>
            </div>
          )}

          {/* Upload error */}
          {uploadStatus === 'error' && uploadError && (
            <div style={{
              fontSize: '12px',
              color: '#c5221f',
              backgroundColor: '#fce8e6',
              padding: '6px 12px',
              borderRadius: '6px',
              maxWidth: '400px',
            }}>
              ❌ {uploadError}
            </div>
          )}
        </div>

        {/* Pivot table */}
        <div style={{ padding: '0 20px 20px' }}>
          <pivot-head ref={pivotRef}></pivot-head>
        </div>

        <TabBar />
      </div>

      {/* ── Analytics Tab ────────────────────────────────────────────────── */}
      <div style={{ display: activeTab === 'analytics' ? 'block' : 'none', padding: '20px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '20px',
        }}>
          {/* Chart header */}
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
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '14px' }}
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

          {/* Filters */}
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
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '14px', minWidth: '150px' }}
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
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '14px', minWidth: '100px' }}
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

            {/* No data message */}
            {chartFilterOptions.measures.length === 0 && (
              <span style={{ fontSize: '13px', color: '#e37400' }}>
                ⚠️ No numeric measures detected — upload a CSV with numeric columns to chart data.
              </span>
            )}
          </div>

          {/* Chart canvas */}
          <div style={{ height: '450px', position: 'relative' }}>
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>

        <TabBar />
      </div>
    </div>
  );
};

export default PivotHeadDemo;
