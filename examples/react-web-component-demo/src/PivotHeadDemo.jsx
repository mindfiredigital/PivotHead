import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';
import { ChartService } from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';
import { data as sampleData, options as sampleOptions } from './config/config';
import { initWasm, parseCSV, detectPivotOptions } from './utils/csvWasm';

// Register Chart.js components
Chart.register(...registerables);

// ─── File reading utility (module level — no closure/stale-ref issues) ─────────

/**
 * Read a File object as a UTF-8 string.
 * Uses the modern file.text() API (Promise-native, available in all modern browsers).
 * Falls back to FileReader for older environments.
 */
async function readFileAsText(file) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file object received.');
  }
  if (file.size === 0) {
    throw new Error(`"${file.name}" is empty (0 bytes). Please choose a non-empty CSV file.`);
  }

  // FileReader — always reliable, unaffected by input.value resets
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      if (reader.error) {
        reject(new Error(`FileReader error: ${reader.error.message}`));
      } else {
        resolve(/** @type {string} */ (reader.result));
      }
    };
    reader.readAsText(file, 'UTF-8');
  });
}

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
  const fileInputRef    = useRef(null);
  const enginePollRef   = useRef(null);

  const [activeTab, setActiveTab]           = useState('table');
  const [chartType, setChartType]           = useState('column');
  const [chartFilterOptions, setChartFilterOptions] = useState({ measures: [], rows: [], columns: [] });
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [selectedLimit, setSelectedLimit]   = useState(5);
  const [engineReady, setEngineReady]       = useState(false);

  // CSV upload state
  const [uploadStatus, setUploadStatus]   = useState(null); // null | 'parsing' | 'done' | 'error'
  const [parseStats, setParseStats]       = useState(null); // { rowCount, colCount, parseTime, method, fileName }
  const [uploadError, setUploadError]     = useState(null);
  const [wasmStatus, setWasmStatus]       = useState('loading'); // 'loading' | 'ready' | 'unavailable'

  // ─── Init WASM on mount ────────────────────────────────────────────────────

  useEffect(() => {
    initWasm().then((ok) => {
      setWasmStatus(ok ? 'ready' : 'unavailable');
    });
  }, []);

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
      console.error('Failed to initialize ChartService:', error);
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

  // ─── CSV file upload handler ──────────────────────────────────────────────

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('parsing');
    setUploadError(null);
    setParseStats(null);

    try {
      const text = await readFileAsText(file);

      // Reset the input AFTER the file has been fully read.
      // Resetting before the async read completes can invalidate the File object
      // in some browsers, causing file.text() / FileReader to return empty content.
      if (fileInputRef.current) fileInputRef.current.value = '';

      console.log(`[CSV] Read "${file.name}": ${text.length} chars`);
      const result = await parseCSV(text);

      const pivotOptions = detectPivotOptions(result.data, result.headers);
      if (!pivotOptions) throw new Error('Could not detect pivot configuration from this CSV.');

      // Feed new data into the web component
      const pivot = pivotRef.current;
      if (!pivot) throw new Error('Pivot component not found.');

      destroyChart();
      chartServiceRef.current = null;
      setChartFilterOptions({ measures: [], rows: [], columns: [] });
      setSelectedMeasure('');

      pivot.data    = result.data;
      pivot.options = pivotOptions;

      // Switch to table tab so user sees the updated pivot
      setActiveTab('table');

      // Wait for the pivot engine to reinitialise with the new data
      startEnginePoll();

      setParseStats({
        fileName:  file.name,
        rowCount:  result.rowCount,
        colCount:  result.colCount,
        parseTime: result.parseTime,
        method:    result.method,
      });
      setUploadStatus('done');
    } catch (err) {
      console.error('CSV upload failed:', err);
      setUploadError(err.message || 'Failed to parse CSV file.');
      setUploadStatus('error');
    }
  }, [destroyChart, startEnginePoll]);

  const triggerFileInput = () => fileInputRef.current?.click();

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
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Upload button */}
            <button
              onClick={triggerFileInput}
              disabled={uploadStatus === 'parsing'}
              title="Upload a CSV file to replace the current data"
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
              {uploadStatus === 'parsing' ? '⏳ Parsing…' : '📂 Upload CSV'}
            </button>

            {/* WASM badge */}
            <span
              title={
                wasmStatus === 'ready'
                  ? 'WebAssembly is active — CSV parsing uses near-native speed'
                  : wasmStatus === 'loading'
                  ? 'Loading WebAssembly…'
                  : 'WebAssembly unavailable — using JavaScript fallback'
              }
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor:
                  wasmStatus === 'ready' ? '#e6f4ea' :
                  wasmStatus === 'loading' ? '#fff8e1' : '#fce8e6',
                color:
                  wasmStatus === 'ready' ? '#137333' :
                  wasmStatus === 'loading' ? '#e37400' : '#c5221f',
                border: `1px solid ${
                  wasmStatus === 'ready' ? '#ceead6' :
                  wasmStatus === 'loading' ? '#fdd663' : '#f5c6c2'
                }`,
              }}
            >
              {wasmStatus === 'ready' ? '⚡ WASM Active' :
               wasmStatus === 'loading' ? '⏳ WASM Loading' : '⚠️ JS Fallback'}
            </span>
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
                {parseStats.method === 'wasm' ? '⚡ WASM' : '📜 JS'}
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
