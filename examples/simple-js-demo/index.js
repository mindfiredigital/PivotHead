'use strict';
/* PivotHead Demo - Bootstrap entry point
 *
 * This file initialises the application and wires up all modules.
 * Feature implementations live in their respective modules under
 * table/, ui/, chart/, and connect/.
 */

import { logger } from './logger.js';
import { appState } from './state.js';
import { createHeader } from '@types/header/header.js';
import { initLLMPanel } from '@types/llm/llm-panel.js';
import { PivotEngine, FieldService } from '@mindfiredigital/pivothead';
import {
  ChartEngine,
  ColorManager,
} from '@mindfiredigital/pivothead-analytics';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

import { sampleData, config } from '@types/config/config.js';

// UI modules
import { addDraggableStyles, addEnhancedDragStyles } from '@types/ui/styles.js';
import { initializeFilters, resetFilters } from '@types/ui/filters.js';
import { updatePaginationInfo } from '@types/ui/pagination.js';
import { setupTabEventListeners } from '@types/ui/tabs.js';

// Table modules
import { renderTable } from '@types/table/renderProcessed.js';

// Chart module
import {
  setupChartEventListeners,
  initializeAnalyticsTab,
} from '@types/chart/chartModule.js';

// File connect module
import { handleFileConnection } from '@types/connect/fileConnect.js';

// ── Private helpers ───────────────────────────────────────────────────────────

function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Add HTML for filter and pagination controls
function addControlsHTML() {
  if (document.querySelector('.controls-container')) return;

  const container = document.createElement('div');
  container.className = 'controls-container';
  container.innerHTML = `
    <div class="filter-container">
      <select id="filterField"></select>
      <select id="filterOperator"></select>
      <input type="text" id="filterValue" placeholder="Filter value">
      <button id="applyFilter">Apply Filter</button>
      <button id="resetFilter">Reset</button>
      <button id="switchView">Switch to Raw Data</button>
    </div>
    <div class="pagination-container">
      <label>Items per page:</label>
      <select id="pageSize">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="10" selected>10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
      <button id="prevPage">Previous</button>
      <span id="pageInfo">Processed Data - Page 1 of 1</span>
      <button id="nextPage">Next</button>
    </div>
  `;
  const myTable = document.getElementById('myTable');
  if (myTable?.parentNode) {
    myTable.parentNode.insertBefore(container, myTable);
  }
}

// Re-configure the pivot engine with a new config object
function formatTable(newConfig) {
  try {
    const rowFields = (newConfig.rows || []).map(r => r.uniqueName);
    const columnFields = (newConfig.columns || []).map(c => c.uniqueName);
    const defaultGroupConfig =
      newConfig.groupConfig ||
      (rowFields.length && columnFields.length
        ? {
            rowFields,
            columnFields,
            grouper: (item, fields) => fields.map(f => item[f]).join('|'),
          }
        : null);

    // Re-initialize engine with new config but same data
    appState.pivotEngine = new PivotEngine({
      ...newConfig,
      groupConfig: defaultGroupConfig || undefined,
      data: appState.pivotEngine.getState().rawData,
    });

    // Re-initialize ChartEngine with the new engine
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

    appState.pivotEngine.setPagination({
      currentPage: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
      totalPages: 1,
    });
    appState.pivotEngine.setDataHandlingMode(
      appState.currentViewMode === 'processed' ? 'processed' : 'raw'
    );

    appState.pivotEngine.subscribe(state => {
      appState.currentData = state.rawData;
      renderTable();
    });
    renderTable();
  } catch (error) {
    logger.error('Error formatting table:', error);
  }
}

// Handle a field-section drop from the header toolbar
function onSectionItemDrop(droppedFields) {
  const selection = {
    rows: Array.from(droppedFields.rows || []),
    columns: Array.from(droppedFields.columns || []),
    values: Array.from(droppedFields.values || new Map()).map(
      ([field, aggregation]) => ({ field, aggregation })
    ),
  };

  const layout = FieldService.buildLayout(selection);

  if (appState.pivotEngine) {
    const newConfig = {
      ...config,
      rows: layout.rows,
      columns: layout.columns,
      measures: layout.measures,
    };
    formatTable(newConfig);
  }
}

// Event listeners for pagination, filters, and view switching
function setupEventListeners() {
  const switchButton = document.getElementById('switchView');
  if (switchButton) {
    switchButton.addEventListener('click', () => {
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'view-loading-indicator';
        loadingIndicator.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        `;
        loadingIndicator.innerHTML = `
          <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <div style="font-size: 16px; font-weight: 600; color: #333;">
            Switching to ${appState.currentViewMode === 'processed' ? 'Raw' : 'Processed'} Data...
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingIndicator);

        setTimeout(() => {
          appState.currentViewMode =
            appState.currentViewMode === 'processed' ? 'raw' : 'processed';
          switchButton.textContent =
            appState.currentViewMode === 'processed'
              ? 'Switch to Raw Data'
              : 'Switch to Processed Data';
          appState.pagination.currentPage = 1;

          if (appState.pivotEngine) {
            try {
              logger.info('Switching to mode:', appState.currentViewMode);

              const stateBeforeSwitch = appState.pivotEngine.getState();
              if (
                stateBeforeSwitch.rawData &&
                stateBeforeSwitch.rawData.length > 0
              ) {
                appState.currentData = stateBeforeSwitch.rawData;
                logger.info(
                  'Pre-switch sync: currentData updated with',
                  appState.currentData.length,
                  'rows'
                );
              }

              appState.pivotEngine.setDataHandlingMode(
                appState.currentViewMode === 'processed' ? 'processed' : 'raw'
              );
              logger.info('Mode switched successfully');

              const stateAfterSwitch = appState.pivotEngine.getState();
              logger.info('State after mode switch:', {
                mode: stateAfterSwitch.dataHandlingMode,
                hasProcessedData: !!stateAfterSwitch.processedData,
                hasRawData: !!stateAfterSwitch.rawData,
                rawDataLength: stateAfterSwitch.rawData?.length || 0,
              });
            } catch (error) {
              logger.error('Error during mode switch:', error);
              alert(
                'Error switching view mode. Please refresh the page and try again.\n\nError: ' +
                  error.message
              );

              appState.currentViewMode =
                appState.currentViewMode === 'processed' ? 'raw' : 'processed';
              switchButton.textContent =
                appState.currentViewMode === 'processed'
                  ? 'Switch to Raw Data'
                  : 'Switch to Processed Data';
              return;
            }
          }

          updatePaginationInfo(
            appState.currentViewMode === 'processed'
              ? 'Processed Data'
              : 'Raw Data'
          );

          try {
            renderTable();
          } catch (renderError) {
            logger.error(
              'Error rendering table after mode switch:',
              renderError
            );
            const tc = document.getElementById('myTable');
            if (tc) {
              const errDiv = document.createElement('div');
              errDiv.style.cssText = 'padding:20px;color:red';
              errDiv.textContent = `Error rendering table: ${renderError.message} — Please refresh the page and try again.`;
              tc.replaceChildren(errDiv);
            }
          }

          setTimeout(() => {
            const indicator = document.getElementById('view-loading-indicator');
            if (indicator) indicator.remove();
          }, 300);
        }, 50);
      }
    });
  }

  const pageSizeElement = document.getElementById('pageSize');
  if (pageSizeElement) {
    pageSizeElement.addEventListener('change', e => {
      const newPageSize = Number(e.target.value);
      const currentFirstItem =
        (appState.pagination.currentPage - 1) * appState.pagination.pageSize;
      appState.pagination.currentPage =
        Math.floor(currentFirstItem / newPageSize) + 1;
      renderTable();
    });
  }

  const prevButton = document.getElementById('prevPage');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (appState.pagination.currentPage > 1) {
        appState.pagination.currentPage--;
        renderTable();
      }
    });
  }

  const nextPageButton = document.getElementById('nextPage');
  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
      if (appState.pagination.currentPage < appState.pagination.totalPages) {
        appState.pagination.currentPage++;
        renderTable();
      }
    });
  }

  const applyFilterButton = document.getElementById('applyFilter');
  if (applyFilterButton) {
    applyFilterButton.addEventListener('click', () => {
      const field = document.getElementById('filterField').value;
      const operator = document.getElementById('filterOperator').value;
      const value = document.getElementById('filterValue').value;

      if (!value) {
        alert('Please enter a filter value');
        return;
      }

      let parsedValue = value;
      try {
        const stateNow = appState.pivotEngine.getState();
        const dataNow = stateNow?.rawData || [];
        const sampleVal = (dataNow.find(
          r => r[field] !== null && r[field] !== undefined
        ) || {})[field];
        const isNumberField =
          typeof sampleVal === 'number' && isFinite(sampleVal);
        if (
          isNumberField &&
          (operator === 'equals' ||
            operator === 'greaterThan' ||
            operator === 'lessThan')
        ) {
          const numValue = parseFloat(String(value).trim());
          if (isNaN(numValue)) {
            alert('Please enter a valid number for ' + field);
            return;
          }
          parsedValue = numValue;
        }
      } catch (e) {
        parsedValue = value;
      }

      const filter = { field, operator, value: parsedValue };
      appState.pivotEngine.applyFilters([filter]);
      appState.pagination.currentPage = 1;
    });
  }

  const resetFilterButton = document.getElementById('resetFilter');
  if (resetFilterButton) {
    resetFilterButton.addEventListener('click', resetFilters);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
      logger.error('Sample data is not available or empty');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="color: red; padding: 20px;">Error: Sample data not available.</div>';
      }
      return;
    }

    const rowFields = (config.rows || []).map(r => r.uniqueName);
    const columnFields = (config.columns || []).map(c => c.uniqueName);
    const defaultGroupConfig =
      config.groupConfig ||
      (rowFields.length && columnFields.length
        ? {
            rowFields,
            columnFields,
            grouper: (item, fields) => fields.map(f => item[f]).join('|'),
          }
        : null);

    // ── Write engine references into appState ─────────────────────────────────
    appState.pivotEngine = new PivotEngine({
      ...config,
      groupConfig: defaultGroupConfig || undefined,
      data: sampleData,
    });

    appState.chartEngine = new ChartEngine(appState.pivotEngine, {
      chartInstance: Chart,
      defaultStyle: {
        colorScheme: appState.currentPalette,
      },
    });

    appState.colorManager = new ColorManager(appState.currentPalette);
    appState.chartService = appState.chartEngine.getChartService();
    appState.currentData = [...sampleData];

    // ── Register cross-module callbacks ───────────────────────────────────────
    appState.onFormatTable = formatTable;
    appState.onSectionItemDrop = onSectionItemDrop;
    appState.onHandleFileConnection = handleFileConnection;
    appState.onRenderTable = renderTable;
    appState.onInitializeAnalyticsTab = initializeAnalyticsTab;

    // ── Configure engine ──────────────────────────────────────────────────────
    appState.pivotEngine.setPagination({
      currentPage: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
      totalPages: 1,
    });
    appState.pivotEngine.setDataHandlingMode('processed');

    appState.pivotEngine.subscribe(state => {
      logger.info('PivotEngine state changed:', {
        sortConfig: state.sortConfig,
        dataHandlingMode: state.dataHandlingMode,
        processedDataLength: state.processedData?.rows?.length || 0,
      });
      appState.currentData = state.rawData;
      renderTable();
    });

    // ── Initialize header if configured ──────────────────────────────────────
    if (config.toolbar && typeof createHeader === 'function') {
      createHeader(config);
    }

    // ── Add UI elements ───────────────────────────────────────────────────────
    addDraggableStyles();
    addControlsHTML();
    initializeFilters();
    setupEventListeners();
    setupChartEventListeners();
    setupTabEventListeners();
    addEnhancedDragStyles();

    // ── Initial render ────────────────────────────────────────────────────────
    renderTable();

    // ── Initialize LLM assistant panel ───────────────────────────────────────
    initLLMPanel(() => appState.pivotEngine);

    logger.info('Initialization completed successfully');
  } catch (error) {
    logger.error('Error during initialization:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'color:red;padding:20px';
      errDiv.textContent = `Error during initialization: ${error.message}`;
      tableContainer.replaceChildren(errDiv);
    }
  }
});

window.debugPivotState = () => {
  if (!appState.pivotEngine) {
    logger.warn('pivotEngine not initialized');
    return;
  }
  const state = appState.pivotEngine.getState();
  logger.info('Sort config:', state.sortConfig);
  logger.info('Groups count:', (state.groups || []).length);
  logger.info('Data handling mode:', state.dataHandlingMode);
};
