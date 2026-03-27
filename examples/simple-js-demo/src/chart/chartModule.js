'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';
import {
  ChartEngine,
  ColorManager,
} from '@mindfiredigital/pivothead-analytics';
import { Chart } from 'chart.js';

// ── Internal helpers ──────────────────────────────────────────────────────────

// Get all available chart data (unfiltered) for populating filter options
function getAllChartData() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return null;
  }

  try {
    const chartServiceInternal = appState.chartEngine.getChartService();
    const filterOptions = chartServiceInternal.getAvailableFilterOptions();
    const rowFieldName = appState.pivotEngine.getRowFieldName();
    const columnFieldName = appState.pivotEngine.getColumnFieldName();

    return {
      rowValues: filterOptions.rows,
      columnValues: filterOptions.columns,
      measures: filterOptions.measures,
      rowFieldName,
      columnFieldName,
    };
  } catch (error) {
    logger.error('Error getting chart data:', error);
    return null;
  }
}

// Get chart title based on type and current filters
function getChartTitle(chartType) {
  const allData = getAllChartData();
  const measureName = allData?.measures?.[0]?.caption || 'Value';
  const chartTypeLabel =
    chartType.charAt(0).toUpperCase() +
    chartType.slice(1).replace(/([A-Z])/g, ' $1');

  const chartServiceInternal = appState.chartEngine?.getChartService();
  const currentFilters = chartServiceInternal?.getFilters() || { limit: 0 };
  const limitText =
    currentFilters.limit > 0 ? ` (Top ${currentFilters.limit})` : '';

  return `${measureName} - ${chartTypeLabel} Chart${limitText}`;
}

function destroyChart() {
  if (appState.chartEngine) {
    appState.chartEngine.destroyChart('#chartContainer');
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function updateColorPalette(newPalette) {
  appState.currentPalette = newPalette;
  if (appState.colorManager) {
    appState.colorManager.setPalette(newPalette);
  }
  if (appState.chartEngine) {
    appState.chartEngine.getColorManager().setPalette(newPalette);
    renderChart(appState.currentChartType);
  }
  logger.info('Color palette updated to:', newPalette);
}

// Populate chart filter dropdowns
export function populateChartFilters() {
  const allData = getAllChartData();
  if (!allData) return;

  const { rowValues, columnValues, measures, rowFieldName, columnFieldName } =
    allData;

  const chartServiceInternal = appState.chartEngine.getChartService();
  const currentFilters = chartServiceInternal.getFilters();

  // Populate measure dropdown
  const measureSelect = document.getElementById('chartMeasureSelect');
  if (measureSelect) {
    measureSelect.innerHTML = measures
      .map(
        (m, idx) =>
          `<option value="${m.uniqueName}" ${idx === 0 ? 'selected' : ''}>${m.caption}</option>`
      )
      .join('');

    if (!currentFilters.selectedMeasure && measures.length > 0) {
      chartServiceInternal.setFilters({
        selectedMeasure: measures[0].uniqueName,
      });
    }
  }

  // Populate rows dropdown (multi-select)
  const rowsSelect = document.getElementById('chartRowsSelect');
  if (rowsSelect) {
    rowsSelect.innerHTML = rowValues
      .map(r => `<option value="${r}" selected>${r}</option>`)
      .join('');

    if (
      !currentFilters.selectedRows ||
      currentFilters.selectedRows.length === 0
    ) {
      chartServiceInternal.setFilters({ selectedRows: [...rowValues] });
    }
  }

  // Populate columns dropdown (multi-select)
  const columnsSelect = document.getElementById('chartColumnsSelect');
  if (columnsSelect) {
    columnsSelect.innerHTML = columnValues
      .map(c => `<option value="${c}" selected>${c}</option>`)
      .join('');

    if (
      !currentFilters.selectedColumns ||
      currentFilters.selectedColumns.length === 0
    ) {
      chartServiceInternal.setFilters({ selectedColumns: [...columnValues] });
    }
  }

  // Update labels with field names
  const rowsLabel = rowsSelect?.previousElementSibling;
  const columnsLabel = columnsSelect?.previousElementSibling;
  if (rowsLabel) rowsLabel.textContent = `Show ${rowFieldName}:`;
  if (columnsLabel) columnsLabel.textContent = `Show ${columnFieldName}:`;
}

// Get current filter selections from the UI
function getChartFilterSelections() {
  const measureSelect = document.getElementById('chartMeasureSelect');
  const rowsSelect = document.getElementById('chartRowsSelect');
  const columnsSelect = document.getElementById('chartColumnsSelect');
  const limitSelect = document.getElementById('chartLimitSelect');

  return {
    selectedMeasure: measureSelect?.value || null,
    selectedRows: Array.from(rowsSelect?.selectedOptions || []).map(
      opt => opt.value
    ),
    selectedColumns: Array.from(columnsSelect?.selectedOptions || []).map(
      opt => opt.value
    ),
    limit: parseInt(limitSelect?.value || '0', 10),
  };
}

export function applyChartFilters() {
  const filterSelections = getChartFilterSelections();

  const chartServiceInternal = appState.chartEngine.getChartService();
  chartServiceInternal.setFilters(filterSelections);

  if (appState.currentChartType && appState.currentChartType !== 'none') {
    renderChart(appState.currentChartType);
  }
}

export function resetChartFilters() {
  const allData = getAllChartData();
  if (!allData) return;

  const { rowValues, columnValues, measures } = allData;

  const chartServiceInternal = appState.chartEngine.getChartService();
  chartServiceInternal.resetFilters();

  chartServiceInternal.setFilters({
    selectedMeasure: measures.length > 0 ? measures[0].uniqueName : null,
    selectedRows: [...rowValues],
    selectedColumns: [...columnValues],
    limit: 5,
  });

  // Reset UI
  const measureSelect = document.getElementById('chartMeasureSelect');
  const rowsSelect = document.getElementById('chartRowsSelect');
  const columnsSelect = document.getElementById('chartColumnsSelect');
  const limitSelect = document.getElementById('chartLimitSelect');

  if (measureSelect && measures.length > 0) {
    measureSelect.value = measures[0].uniqueName;
  }
  if (rowsSelect) {
    Array.from(rowsSelect.options).forEach(opt => (opt.selected = true));
  }
  if (columnsSelect) {
    Array.from(columnsSelect.options).forEach(opt => (opt.selected = true));
  }
  if (limitSelect) {
    limitSelect.value = '5';
  }

  if (appState.currentChartType && appState.currentChartType !== 'none') {
    renderChart(appState.currentChartType);
  }
}

export function showChartSection() {
  populateChartFilters();
}

export function hideChartSection() {
  const chartTypeSelect = document.getElementById('chartType');
  if (chartTypeSelect) chartTypeSelect.value = 'column';
  appState.currentChartType = 'column';

  if (appState.chartEngine) {
    const chartServiceInternal = appState.chartEngine.getChartService();
    chartServiceInternal.resetFilters();
  }

  destroyChart();
}

export function getChartRecommendations() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return [];
  }
  return appState.chartEngine.recommend();
}

export function autoDetectChart() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }

  const recommendations = getChartRecommendations();
  if (recommendations.length > 0) {
    const bestType = recommendations[0].type;
    const chartTypeSelect = document.getElementById('chartType');
    if (chartTypeSelect) {
      chartTypeSelect.value = bestType;
    }
    renderChart(bestType);

    const chartTitle = document.getElementById('chartTitle');
    if (chartTitle) {
      chartTitle.textContent = `${getChartTitle(bestType)} (Auto-detected)`;
    }
  }
}

export function showRecommendationsPanel() {
  const panel = document.getElementById('recommendationsPanel');
  const list = document.getElementById('recommendationsList');

  if (!panel || !list) return;

  const recommendations = getChartRecommendations();

  list.innerHTML = recommendations
    .map(
      rec => `
    <div class="recommendation-item" data-type="${rec.type}">
      <div class="recommendation-info">
        <span class="recommendation-type">${rec.type.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span class="recommendation-reason">${rec.reason}</span>
      </div>
      <div class="recommendation-score">
        <div class="score-bar">
          <div class="score-fill" style="width: ${rec.score * 100}%"></div>
        </div>
        <span class="score-text">${Math.round(rec.score * 100)}%</span>
      </div>
    </div>
  `
    )
    .join('');

  list.querySelectorAll('.recommendation-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const chartTypeSelect = document.getElementById('chartType');
      if (chartTypeSelect) {
        chartTypeSelect.value = type;
      }
      renderChart(type);
      panel.style.display = 'none';
    });
  });

  panel.style.display = 'block';
}

export function hideRecommendationsPanel() {
  const panel = document.getElementById('recommendationsPanel');
  if (panel) {
    panel.style.display = 'none';
  }
}

export async function exportChartAsPng() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }
  try {
    await appState.chartEngine.exportAsPng(
      '#chartContainer',
      `pivot-chart-${Date.now()}`
    );
  } catch (error) {
    logger.error('Error exporting PNG:', error);
    alert('Could not export chart as PNG. Please try again.');
  }
}

export async function exportChartAsCsv() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }
  try {
    await appState.chartEngine.exportAsCsv(
      '#chartContainer',
      `pivot-chart-data-${Date.now()}`
    );
  } catch (error) {
    logger.error('Error exporting CSV:', error);
    alert('Could not export chart as CSV. Please try again.');
  }
}

export async function exportChartAsJson() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }
  try {
    await appState.chartEngine.exportAsJson(
      '#chartContainer',
      `pivot-chart-data-${Date.now()}`
    );
  } catch (error) {
    logger.error('Error exporting JSON:', error);
    alert('Could not export chart as JSON. Please try again.');
  }
}

// Main chart rendering dispatcher
export function renderChart(chartType) {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }

  if (!chartType) {
    chartType = 'column';
  }

  appState.currentChartType = chartType;

  destroyChart();

  const chartContainer = document.getElementById('chartContainer');
  if (!chartContainer.querySelector('canvas')) {
    chartContainer.innerHTML = '<canvas id="pivotChart"></canvas>';
  }

  try {
    const colors = appState.colorManager
      ? appState.colorManager.getColors(10)
      : undefined;

    appState.chartEngine.render({
      type: chartType,
      container: '#chartContainer',
      style: {
        title: getChartTitle(chartType),
        colorScheme: appState.currentPalette,
        colors: colors,
      },
    });

    const chartTitle = document.getElementById('chartTitle');
    if (chartTitle) {
      chartTitle.textContent = getChartTitle(chartType);
    }

    logger.info(`Rendered ${chartType} chart using ChartEngine`);
  } catch (error) {
    logger.error('Error rendering chart:', error);
    chartContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #666;">
        <div style="text-align: center;">
          <p>Unable to render ${chartType} chart.</p>
          <p style="font-size: 12px;">Error: ${error.message}</p>
        </div>
      </div>
    `;
  }
}

// Initialize analytics tab (called when first switching to it, or after data changes)
export function initializeAnalyticsTab() {
  if (!appState.chartEngine) {
    logger.error('ChartEngine not initialized');
    return;
  }

  destroyChart();

  appState.analyticsTabInitialized = true;

  const chartServiceInternal = appState.chartEngine.getChartService();
  chartServiceInternal.resetFilters();

  populateChartFilters();

  const chartTypeSelect = document.getElementById('chartType');
  if (chartTypeSelect) {
    renderChart(chartTypeSelect.value || 'column');
  }

  logger.info('Analytics tab initialized with ChartEngine');
}

// Setup chart event listeners
export function setupChartEventListeners() {
  const chartTypeSelect = document.getElementById('chartType');
  const applyFilterButton = document.getElementById('applyChartFilter');
  const resetFilterButton = document.getElementById('resetChartFilter');
  const autoDetectBtn = document.getElementById('autoDetectBtn');
  const showRecommendationsBtn = document.getElementById(
    'showRecommendationsBtn'
  );
  const closeRecommendationsBtn = document.getElementById(
    'closeRecommendations'
  );
  const colorPaletteSelect = document.getElementById('colorPalette');
  const exportPngBtn = document.getElementById('exportPng');
  const exportCsvBtn = document.getElementById('exportCsv');
  const exportJsonBtn = document.getElementById('exportJson');

  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', e => {
      if (appState.chartEngine) {
        const chartServiceInternal = appState.chartEngine.getChartService();
        chartServiceInternal.resetFilters();
        populateChartFilters();
      }
      renderChart(e.target.value);
    });
  }

  if (applyFilterButton) {
    applyFilterButton.addEventListener('click', () => {
      applyChartFilters();
    });
  }

  if (resetFilterButton) {
    resetFilterButton.addEventListener('click', () => {
      resetChartFilters();
    });
  }

  if (autoDetectBtn) {
    autoDetectBtn.addEventListener('click', () => {
      autoDetectChart();
    });
  }

  if (showRecommendationsBtn) {
    showRecommendationsBtn.addEventListener('click', () => {
      showRecommendationsPanel();
    });
  }

  if (closeRecommendationsBtn) {
    closeRecommendationsBtn.addEventListener('click', () => {
      hideRecommendationsPanel();
    });
  }

  if (colorPaletteSelect) {
    colorPaletteSelect.addEventListener('change', e => {
      updateColorPalette(e.target.value);
    });
  }

  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', () => {
      exportChartAsPng();
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportChartAsCsv();
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      exportChartAsJson();
    });
  }
}
