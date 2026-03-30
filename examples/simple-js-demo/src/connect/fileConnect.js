'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';
import { ConnectService } from '@mindfiredigital/pivothead';
import { ChartEngine } from '@mindfiredigital/pivothead-analytics';
import { Chart } from 'chart.js';
import { initializeFilters, resetFilters } from '../ui/filters.js';
import { initializeAnalyticsTab } from '../chart/chartModule.js';

// Loading indicator functions
export function showLoadingIndicator(message = 'Loading...') {
  let loader = document.getElementById('file-loader');

  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'file-loader';
    loader.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      min-width: 350px;
      max-width: 500px;
    `;

    loader.innerHTML = `
      <div id="loading-message" style="margin-bottom: 20px; font-size: 16px; font-weight: bold;">
        ${message}
      </div>
      <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
        <div id="progress-bar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>
      </div>
      <div id="progress-text" style="margin-top: 10px; font-size: 14px; color: #666;">
        0%
      </div>
      <div id="progress-status" style="margin-top: 10px; font-size: 12px; color: #999; min-height: 18px;">
      </div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'loader-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(loader);
  }
}

export function updateLoadingProgress(progress) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressStatus = document.getElementById('progress-status');

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  if (progressText) {
    progressText.textContent = `${Math.round(progress)}%`;
  }
  if (progressStatus) {
    if (progress < 70) {
      progressStatus.textContent = 'Reading and parsing file...';
    } else if (progress < 90) {
      progressStatus.textContent = 'Processing data...';
    } else if (progress < 95) {
      progressStatus.textContent = 'Building pivot layout...';
    } else {
      progressStatus.textContent = 'Finalizing...';
    }
  }
}

export function hideLoadingIndicator() {
  const loader = document.getElementById('file-loader');
  const backdrop = document.getElementById('loader-backdrop');

  if (loader) loader.remove();
  if (backdrop) backdrop.remove();
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function showImportNotification(result, isSuccess) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10001;
    font-family: Arial, sans-serif;
    ${
      isSuccess
        ? 'background: #d4edda; border-left: 4px solid #28a745; color: #155724;'
        : 'background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;'
    }
  `;

  const title = document.createElement('div');
  title.style.cssText =
    'font-weight: bold; margin-bottom: 10px; font-size: 16px;';
  title.textContent = isSuccess ? 'Import Successful' : 'Import Failed';

  const content = document.createElement('div');
  content.style.cssText = 'font-size: 14px; line-height: 1.4;';

  if (isSuccess) {
    content.innerHTML = `
      <div><strong>File:</strong> ${result.fileName}</div>
      <div><strong>Records:</strong> ${result.recordCount?.toLocaleString()}</div>
      <div><strong>Size:</strong> ${formatFileSize(result.fileSize)}</div>
      ${result.columns ? `<div><strong>Columns:</strong> ${result.columns.length}</div>` : ''}
      ${
        result.validationErrors?.length
          ? `<div style="margin-top: 10px; color: #856404;"><strong>Warnings:</strong><br>${result.validationErrors.map(w => `• ${w}`).join('<br>')}</div>`
          : ''
      }
    `;
  } else {
    content.textContent = result.error || 'Unknown error occurred';
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    opacity: 0.7;
  `;

  closeBtn.addEventListener('click', () => notification.remove());

  notification.appendChild(title);
  notification.appendChild(content);
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);

  // Auto-remove after 8 seconds for success, 12 seconds for error
  setTimeout(
    () => {
      if (notification.parentNode) {
        notification.remove();
      }
    },
    isSuccess ? 8000 : 12000
  );
}

// Helper function to update config based on imported data
export function updateConfigFromImportedData(result, config) {
  if (!result.columns || result.columns.length === 0) return;

  const columns = result.columns;
  const sampleDataRows = result.data.slice(0, 5);

  // Detect potential measure fields (numeric data)
  const measureFields = columns.filter(col => {
    const sampleValues = sampleDataRows
      .map(row => row[col])
      .filter(val => val != null);
    return (
      sampleValues.length > 0 &&
      sampleValues.every(val => typeof val === 'number' && !isNaN(val))
    );
  });

  // Detect potential dimension fields (text/categorical data only)
  const measureSet = new Set(measureFields);
  const dimensionFields = columns.filter(col => {
    if (measureSet.has(col)) return false;
    const sampleValues = sampleDataRows
      .map(row => row[col])
      .filter(val => val != null);
    const uniqueValues = [...new Set(sampleValues)];
    return (
      sampleValues.some(val => typeof val === 'string') ||
      uniqueValues.length <= Math.max(10, sampleDataRows.length * 0.5)
    );
  });

  const engineHasAllColumn =
    appState.pivotEngine &&
    appState.pivotEngine.getColumnFieldName &&
    appState.pivotEngine.getColumnFieldName() === '__all__';

  if (dimensionFields.length >= 1 && measureFields.length >= 1) {
    const newConfig = {
      ...config,
      rows: dimensionFields.slice(0, 1).map(field => ({
        uniqueName: field,
        caption: field,
      })),
      columns:
        engineHasAllColumn || dimensionFields.length < 2
          ? [{ uniqueName: '__all__', caption: 'All' }]
          : dimensionFields.slice(1, 2).map(field => ({
              uniqueName: field,
              caption: field,
            })),
      measures: measureFields.slice(0, 3).map(field => ({
        uniqueName: field,
        caption: field,
        aggregation: 'sum',
      })),
    };

    // Invoke the registered formatTable callback
    if (typeof appState.onFormatTable === 'function') {
      appState.onFormatTable(newConfig);
    }

    logger.info('Auto-configured pivot table:', {
      rows: newConfig.rows,
      columns: newConfig.columns,
      measures: newConfig.measures,
    });
  }
}

// Main file connection handler
export async function handleFileConnection(fileType) {
  try {
    let result;

    showLoadingIndicator('Connecting to file...');

    switch (fileType) {
      case 'CSV':
        result = await ConnectService.connectToLocalCSV(appState.pivotEngine, {
          dimensions: [],
          csv: {
            delimiter: ',',
            hasHeader: true,
            skipEmptyLines: true,
            trimValues: true,
            dynamicTyping: false,
          },
          maxFileSize: 1024 * 1024 * 1024, // 1GB
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
        break;

      case 'JSON':
        result = await ConnectService.connectToLocalJSON(appState.pivotEngine, {
          json: {
            arrayPath: null,
            validateSchema: true,
          },
          maxFileSize: 1024 * 1024 * 1024, // 1GB
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
        break;

      default:
        result = await ConnectService.connectToLocalFile(appState.pivotEngine, {
          maxFileSize: 1024 * 1024 * 1024, // 1GB
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
    }

    hideLoadingIndicator();

    if (result.success) {
      // Store performance mode for debugging
      appState.lastPerformanceMode = result.performanceMode || 'unknown';

      // Log performance information
      logger.info('File processing summary:');
      logger.info(
        `Processing Mode: ${(result.performanceMode || 'standard').toUpperCase()}`
      );
      logger.info(
        `File Size: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB`
      );
      logger.info(`Records: ${result.recordCount?.toLocaleString() || 'N/A'}`);
      if (result.parseTime) {
        logger.info(`Parse Time: ${(result.parseTime / 1000).toFixed(2)}s`);
      }

      // Update current data reference
      appState.currentData = result.data;

      // Reset pagination and filters
      appState.pagination.currentPage = 1;
      resetFilters();

      // Rebuild filter UI to reflect newly imported fields
      initializeFilters();

      // Re-initialize ChartEngine with the updated pivotEngine data
      if (appState.chartEngine) {
        appState.chartEngine.dispose();
      }
      appState.chartEngine = new ChartEngine(appState.pivotEngine, {
        chartInstance: Chart,
        defaultStyle: {
          colorScheme: appState.currentPalette,
        },
      });
      appState.chartService = appState.chartEngine.getChartService();

      // Reset analytics tab so it re-initializes with the new data
      appState.analyticsTabInitialized = false;

      // If currently on analytics tab, re-initialize it immediately
      const analyticsTab = document.getElementById('analytics-tab');
      if (analyticsTab && analyticsTab.classList.contains('active')) {
        initializeAnalyticsTab();
      }

      // Show success notification
      showImportNotification(result, true);

      // Re-initialize engine with the groupConfig that matches the new CSV
      // field names.  applyParsedDataToEngine (core) updates rows/columns/
      // measures on the existing engine but never touches groupConfig, so
      // the old grouper still uses the previous dataset's field names and
      // produces "undefined|undefined" group keys → all cell values show 0.
      // Calling onFormatTable rebuilds the engine (and groupConfig) from the
      // layout that core auto-detected, which fixes the zero-values bug.
      if (typeof appState.onFormatTable === 'function') {
        const updatedState = appState.pivotEngine.getState();
        appState.onFormatTable({
          rows: updatedState.rows || [],
          columns: updatedState.columns || [],
          measures: updatedState.measures || [],
        });
      } else if (typeof appState.onRenderTable === 'function') {
        appState.onRenderTable();
      }

      logger.info(
        'File connection successful:',
        ConnectService.createImportSummary(result)
      );
    } else {
      logger.error('File connection failed:', result.error);
      showImportNotification(result, false);
    }
  } catch (error) {
    hideLoadingIndicator();
    logger.error('Error during file connection:', error);
    showImportNotification(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      false
    );
  }
}
