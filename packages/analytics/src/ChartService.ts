/**
 * ChartService - Transforms pivot table data for chart visualization
 * Provides methods to extract and format data for various chart types
 */

import type { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  ChartType,
  ChartConfig,
  ChartFilterConfig,
  ChartData,
  ChartDataset,
  ScatterChartData,
  ScatterDataset,
  ScatterPoint,
  HeatmapChartData,
  HeatmapCell,
  SankeyChartData,
  SankeyFlow,
  HistogramChartData,
} from './types';

/**
 * Default chart filter configuration
 */
const DEFAULT_FILTER_CONFIG: ChartFilterConfig = {
  selectedMeasure: undefined,
  selectedRows: [],
  selectedColumns: [],
  limit: 5,
};

/**
 * ChartService class for transforming pivot data to chart-ready format
 */
export class ChartService<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private engine: PivotEngine<T>;
  private filterConfig: ChartFilterConfig;

  constructor(engine: PivotEngine<T>) {
    this.engine = engine;
    this.filterConfig = { ...DEFAULT_FILTER_CONFIG };
  }

  /**
   * Set filter configuration
   */
  setFilters(config: Partial<ChartFilterConfig>): void {
    this.filterConfig = { ...this.filterConfig, ...config };
  }

  /**
   * Get current filter configuration
   */
  getFilters(): ChartFilterConfig {
    return { ...this.filterConfig };
  }

  /**
   * Reset filters to defaults
   */
  resetFilters(): void {
    this.filterConfig = { ...DEFAULT_FILTER_CONFIG };
  }

  /**
   * Get all available data for populating filter UI
   */
  getAvailableFilterOptions(): {
    measures: Array<{ uniqueName: string; caption: string }>;
    rows: string[];
    columns: string[];
  } {
    const state = this.engine.getState();
    const measures = (state.measures || []).map(m => ({
      uniqueName: m.uniqueName,
      caption: m.caption || m.uniqueName,
    }));

    const rowFieldName = this.engine.getRowFieldName();
    const columnFieldName = this.engine.getColumnFieldName();

    const rows = rowFieldName ? this.getUniqueFieldValues(rowFieldName) : [];
    const columns = columnFieldName
      ? this.getUniqueFieldValues(columnFieldName)
      : [];

    return { measures, rows, columns };
  }

  /**
   * Get unique values for a field from raw data
   */
  private getUniqueFieldValues(fieldName: string): string[] {
    const state = this.engine.getState();
    const rawData = state.rawData || [];
    const uniqueValues = new Set<string>();

    rawData.forEach((item: Record<string, unknown>) => {
      if (item[fieldName] !== undefined && item[fieldName] !== null) {
        uniqueValues.add(String(item[fieldName]));
      }
    });

    return Array.from(uniqueValues);
  }

  /**
   * Get chart data for standard charts (bar, line, pie, etc.)
   */
  getChartData(config?: Partial<ChartConfig>): ChartData {
    const state = this.engine.getState();
    const rowFieldName = this.engine.getRowFieldName();
    const columnFieldName = this.engine.getColumnFieldName();
    const measures = state.measures || [];

    // Get all values
    const allRowValues = rowFieldName
      ? this.getUniqueFieldValues(rowFieldName)
      : [];
    const allColumnValues = columnFieldName
      ? this.getUniqueFieldValues(columnFieldName)
      : [];

    // Apply filters
    const filters = { ...this.filterConfig, ...config?.filters };

    let filteredRowValues = filters.selectedRows?.length
      ? allRowValues.filter(r => filters.selectedRows!.includes(r))
      : [...allRowValues];

    const filteredColumnValues = filters.selectedColumns?.length
      ? allColumnValues.filter(c => filters.selectedColumns!.includes(c))
      : [...allColumnValues];

    // Get selected measure
    const selectedMeasureName =
      filters.selectedMeasure || measures[0]?.uniqueName;
    const selectedMeasure =
      measures.find(m => m.uniqueName === selectedMeasureName) || measures[0];

    // Build data matrix
    const dataMatrix: Record<string, Record<string, number>> = {};
    if (rowFieldName && columnFieldName) {
      filteredRowValues.forEach(rowVal => {
        dataMatrix[rowVal] = {};
        filteredColumnValues.forEach(colVal => {
          const value = this.engine.calculateCellValue(
            rowVal,
            colVal,
            selectedMeasure,
            rowFieldName,
            columnFieldName
          );
          dataMatrix[rowVal][colVal] = value || 0;
        });
      });
    }

    // Apply limit if set
    if (
      filters.limit &&
      filters.limit > 0 &&
      filteredRowValues.length > filters.limit
    ) {
      const rowTotals = filteredRowValues.map(rowVal => {
        let total = 0;
        filteredColumnValues.forEach(colVal => {
          total += dataMatrix[rowVal][colVal] || 0;
        });
        return { row: rowVal, total };
      });

      rowTotals.sort((a, b) => b.total - a.total);
      filteredRowValues = rowTotals.slice(0, filters.limit).map(rt => rt.row);
    }

    // Build datasets
    const datasets: ChartDataset[] = filteredColumnValues.map(
      (colVal, idx) => ({
        label: colVal,
        data: filteredRowValues.map(
          rowVal => dataMatrix[rowVal]?.[colVal] || 0
        ),
        backgroundColor: this.getColor(idx),
        borderColor: this.getBorderColor(idx),
        borderWidth: 1,
      })
    );

    return {
      labels: filteredRowValues,
      datasets,
      rowFieldName: rowFieldName || '',
      columnFieldName: columnFieldName || '',
      measures: measures.map(m => ({
        uniqueName: m.uniqueName,
        caption: m.caption || m.uniqueName,
      })),
      selectedMeasure: {
        uniqueName: selectedMeasure?.uniqueName || '',
        caption: selectedMeasure?.caption || selectedMeasure?.uniqueName || '',
      },
      allRowValues,
      allColumnValues,
      filteredRowValues,
      filteredColumnValues,
    };
  }

  /**
   * Get aggregated data for pie/doughnut charts
   */
  getAggregatedChartData(config?: Partial<ChartConfig>): ChartData {
    const chartData = this.getChartData(config);

    // Aggregate by row (sum across all columns)
    const aggregatedData = chartData.labels.map((_, idx) => {
      return chartData.datasets.reduce(
        (sum, dataset) => sum + (dataset.data[idx] || 0),
        0
      );
    });

    return {
      ...chartData,
      datasets: [
        {
          label: chartData.selectedMeasure.caption,
          data: aggregatedData,
          backgroundColor: chartData.labels.map((_, idx) => this.getColor(idx)),
          borderColor: chartData.labels.map((_, idx) =>
            this.getBorderColor(idx)
          ),
          borderWidth: 2,
        },
      ],
    };
  }

  /**
   * Get scatter plot data
   */
  getScatterData(config?: Partial<ChartConfig>): ScatterChartData {
    const state = this.engine.getState();
    const measures = state.measures || [];
    const filters = { ...this.filterConfig, ...config?.filters };

    const xMeasure =
      measures.find(m => m.uniqueName === filters.selectedMeasure) ||
      measures[0];
    const yMeasure = measures[1] || xMeasure;

    const chartData = this.getChartData(config);

    const datasets: ScatterDataset[] = chartData.filteredColumnValues.map(
      (colVal, idx) => {
        const points: ScatterPoint[] = chartData.filteredRowValues.map(
          rowVal => {
            const xValue =
              this.engine.calculateCellValue(
                rowVal,
                colVal,
                xMeasure,
                chartData.rowFieldName,
                chartData.columnFieldName
              ) || 0;
            const yValue =
              this.engine.calculateCellValue(
                rowVal,
                colVal,
                yMeasure,
                chartData.rowFieldName,
                chartData.columnFieldName
              ) || 0;

            return { x: xValue, y: yValue, label: rowVal };
          }
        );

        return {
          label: colVal,
          data: points,
          backgroundColor: this.getColor(idx),
          borderColor: this.getBorderColor(idx),
          pointRadius: 8,
          pointHoverRadius: 12,
        };
      }
    );

    return {
      ...chartData,
      datasets,
      xMeasure: {
        uniqueName: xMeasure?.uniqueName || '',
        caption: xMeasure?.caption || '',
      },
      yMeasure: {
        uniqueName: yMeasure?.uniqueName || '',
        caption: yMeasure?.caption || '',
      },
    };
  }

  /**
   * Get heatmap data
   */
  getHeatmapData(config?: Partial<ChartConfig>): HeatmapChartData {
    const chartData = this.getChartData(config);
    const cells: HeatmapCell[] = [];
    let minValue = Infinity;
    let maxValue = -Infinity;

    chartData.filteredRowValues.forEach((rowVal, rowIdx) => {
      chartData.filteredColumnValues.forEach((colVal, colIdx) => {
        const value =
          chartData.datasets.find(d => d.label === colVal)?.data[rowIdx] || 0;
        cells.push({ x: colIdx, y: rowIdx, value });
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });

    return {
      ...chartData,
      cells,
      minValue: minValue === Infinity ? 0 : minValue,
      maxValue: maxValue === -Infinity ? 0 : maxValue,
    };
  }

  /**
   * Get Sankey diagram data
   */
  getSankeyData(config?: Partial<ChartConfig>): SankeyChartData {
    const chartData = this.getChartData(config);
    const flows: SankeyFlow[] = [];

    chartData.filteredRowValues.forEach((rowVal, rowIdx) => {
      chartData.filteredColumnValues.forEach(colVal => {
        const dataset = chartData.datasets.find(d => d.label === colVal);
        const value = dataset?.data[rowIdx] || 0;
        if (value > 0) {
          flows.push({ from: rowVal, to: colVal, flow: value });
        }
      });
    });

    return {
      ...chartData,
      flows,
    };
  }

  /**
   * Get histogram data
   */
  getHistogramData(
    config?: Partial<ChartConfig>,
    numBins: number = 10
  ): HistogramChartData {
    const chartData = this.getChartData(config);

    // Collect all values
    const allValues: number[] = [];
    chartData.datasets.forEach(dataset => {
      dataset.data.forEach(val => {
        if (val > 0) allValues.push(val);
      });
    });

    if (allValues.length === 0) {
      return {
        ...chartData,
        binLabels: [],
        binCounts: [],
        numBins: 0,
      };
    }

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const binWidth = (maxVal - minVal) / numBins || 1;

    const bins = Array(numBins).fill(0) as number[];
    const binLabels: string[] = [];

    for (let i = 0; i < numBins; i++) {
      const binStart = minVal + i * binWidth;
      const binEnd = binStart + binWidth;
      binLabels.push(`${binStart.toFixed(0)}-${binEnd.toFixed(0)}`);

      allValues.forEach(val => {
        if (
          val >= binStart &&
          (val < binEnd || (i === numBins - 1 && val === maxVal))
        ) {
          bins[i]++;
        }
      });
    }

    return {
      ...chartData,
      binLabels,
      binCounts: bins,
      numBins,
    };
  }

  /**
   * Get stacked chart data (adds stacked property to datasets)
   */
  getStackedChartData(config?: Partial<ChartConfig>): ChartData {
    const chartData = this.getChartData(config);
    return {
      ...chartData,
      datasets: chartData.datasets.map(dataset => ({
        ...dataset,
      })),
    };
  }

  /**
   * Get combo chart data (bar + line)
   */
  getComboChartData(config?: Partial<ChartConfig>): ChartData {
    const chartData = this.getChartData(config);

    // Calculate total line
    const totalData = chartData.labels.map((_, idx) => {
      return chartData.datasets.reduce(
        (sum, dataset) => sum + (dataset.data[idx] || 0),
        0
      );
    });

    // Add bar datasets with type
    const barDatasets: ChartDataset[] = chartData.datasets.map(dataset => ({
      ...dataset,
      type: 'bar',
      order: 2,
    }));

    // Add line dataset for totals
    const lineDataset: ChartDataset = {
      label: `Total ${chartData.selectedMeasure.caption}`,
      data: totalData,
      type: 'line',
      borderColor: 'rgba(0, 0, 0, 0.8)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 3,
      fill: false,
      tension: 0.1,
      order: 1,
    };

    return {
      ...chartData,
      datasets: [...barDatasets, lineDataset],
    };
  }

  /**
   * Get data for a specific chart type
   */
  getDataForChartType(
    chartType: ChartType,
    config?: Partial<ChartConfig>
  ):
    | ChartData
    | ScatterChartData
    | HeatmapChartData
    | SankeyChartData
    | HistogramChartData {
    switch (chartType) {
      case 'pie':
      case 'doughnut':
      case 'funnel':
        return this.getAggregatedChartData(config);

      case 'scatter':
        return this.getScatterData(config);

      case 'heatmap':
        return this.getHeatmapData(config);

      case 'sankey':
        return this.getSankeyData(config);

      case 'histogram':
        return this.getHistogramData(config);

      case 'stackedColumn':
      case 'stackedBar':
      case 'stackedArea':
        return this.getStackedChartData(config);

      case 'comboBarLine':
      case 'comboAreaLine':
        return this.getComboChartData(config);

      case 'column':
      case 'bar':
      case 'line':
      case 'area':
      default:
        return this.getChartData(config);
    }
  }

  /**
   * Get color from default palette
   */
  private getColor(index: number): string {
    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(46, 204, 113, 0.8)',
      'rgba(231, 76, 60, 0.8)',
      'rgba(52, 73, 94, 0.8)',
      'rgba(241, 196, 15, 0.8)',
    ];
    return colors[index % colors.length];
  }

  /**
   * Get border color from default palette
   */
  private getBorderColor(index: number): string {
    return this.getColor(index).replace('0.8)', '1)');
  }
}
