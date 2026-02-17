/**
 * DataTransformer - Transforms raw pivot data to chart-ready formats
 * Provides standalone data transformation utilities for chart rendering
 */

import type {
  ChartData,
  ChartDataset,
  HeatmapCell,
  HeatmapChartData,
  ScatterPoint,
  ScatterDataset,
  ScatterChartData,
  SankeyFlow,
  SankeyChartData,
  TreemapNode,
  TreemapChartData,
  HistogramChartData,
} from '../types';
import { DEFAULT_CHART_COLORS, DEFAULT_CHART_BORDER_COLORS } from '../types';

/**
 * Options for data transformation
 */
export interface TransformOptions {
  /** Limit number of items */
  limit?: number;
  /** Sort by value or label */
  sortBy?: 'value' | 'label' | 'none';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Aggregation method */
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

/**
 * Matrix data structure for transformations
 */
export interface DataMatrix {
  rowValues: string[];
  columnValues: string[];
  values: Record<string, Record<string, number>>;
}

/**
 * DataTransformer class for converting data between formats
 */
export class DataTransformer {
  /**
   * Transform a data matrix to chart datasets
   */
  static toDatasets(
    matrix: DataMatrix,
    colors?: string[]
  ): { labels: string[]; datasets: ChartDataset[] } {
    const { rowValues, columnValues, values } = matrix;
    const colorPalette = colors ?? DEFAULT_CHART_COLORS;
    const borderPalette = colors
      ? colors.map(c => c.replace(/[\d.]+\)$/, '1)'))
      : DEFAULT_CHART_BORDER_COLORS;

    const datasets: ChartDataset[] = columnValues.map((colVal, colIndex) => ({
      label: colVal,
      data: rowValues.map(rowVal => values[rowVal]?.[colVal] ?? 0),
      backgroundColor: colorPalette[colIndex % colorPalette.length],
      borderColor: borderPalette[colIndex % borderPalette.length],
      borderWidth: 1,
    }));

    return {
      labels: rowValues,
      datasets,
    };
  }

  /**
   * Aggregate data for pie/doughnut charts
   * Sums all columns for each row to create a single value per category
   */
  static aggregate(
    data: ChartData,
    aggregation: 'sum' | 'avg' = 'sum'
  ): ChartData {
    const aggregatedValues = data.labels.map((_, idx) => {
      const values = data.datasets.map(ds => ds.data[idx] ?? 0);
      if (aggregation === 'sum') {
        return values.reduce((sum, v) => sum + v, 0);
      } else {
        const sum = values.reduce((s, v) => s + v, 0);
        return values.length > 0 ? sum / values.length : 0;
      }
    });

    return {
      ...data,
      datasets: [
        {
          label: data.selectedMeasure?.caption ?? 'Value',
          data: aggregatedValues,
          backgroundColor: DEFAULT_CHART_COLORS.slice(0, data.labels.length),
          borderColor: DEFAULT_CHART_BORDER_COLORS.slice(0, data.labels.length),
          borderWidth: 1,
        },
      ],
    };
  }

  /**
   * Apply limit and sorting to chart data
   */
  static applyLimit(
    data: ChartData,
    limit: number,
    sortBy: 'value' | 'label' = 'value',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): ChartData {
    if (limit <= 0 || data.labels.length <= limit) {
      return data;
    }

    // Calculate totals for sorting by value
    const totals = data.labels.map((label, idx) => ({
      label,
      index: idx,
      total: data.datasets.reduce((sum, ds) => sum + (ds.data[idx] ?? 0), 0),
    }));

    // Sort
    if (sortBy === 'value') {
      totals.sort((a, b) =>
        sortOrder === 'desc' ? b.total - a.total : a.total - b.total
      );
    } else {
      totals.sort((a, b) =>
        sortOrder === 'desc'
          ? b.label.localeCompare(a.label)
          : a.label.localeCompare(b.label)
      );
    }

    // Take top N
    const topItems = totals.slice(0, limit);
    const indices = topItems.map(item => item.index);
    const newLabels = topItems.map(item => item.label);

    // Reorder datasets
    const newDatasets = data.datasets.map(ds => ({
      ...ds,
      data: indices.map(idx => ds.data[idx]),
    }));

    return {
      ...data,
      labels: newLabels,
      datasets: newDatasets,
      filteredRowValues: newLabels,
    };
  }

  /**
   * Convert chart data to heatmap format
   */
  static toHeatmap(data: ChartData): HeatmapChartData {
    const cells: HeatmapCell[] = [];
    let minValue = Infinity;
    let maxValue = -Infinity;

    data.labels.forEach((_rowLabel, rowIdx) => {
      data.datasets.forEach((dataset, colIdx) => {
        const value = dataset.data[rowIdx] ?? 0;
        cells.push({
          x: colIdx,
          y: rowIdx,
          value,
        });
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });

    return {
      labels: data.labels,
      rowFieldName: data.rowFieldName,
      columnFieldName: data.columnFieldName,
      measures: data.measures,
      selectedMeasure: data.selectedMeasure,
      allRowValues: data.allRowValues,
      allColumnValues: data.allColumnValues,
      filteredRowValues: data.filteredRowValues,
      filteredColumnValues: data.filteredColumnValues,
      cells,
      minValue: minValue === Infinity ? 0 : minValue,
      maxValue: maxValue === -Infinity ? 0 : maxValue,
    };
  }

  /**
   * Convert chart data to scatter format
   * Requires at least 2 measures for x and y axes
   */
  static toScatter(
    matrix: DataMatrix,
    xMeasure: { uniqueName: string; caption: string },
    yMeasure: { uniqueName: string; caption: string },
    xValues: Record<string, Record<string, number>>,
    yValues: Record<string, Record<string, number>>,
    colors?: string[]
  ): ScatterChartData {
    const colorPalette = colors ?? DEFAULT_CHART_COLORS;
    const datasets: ScatterDataset[] = [];

    matrix.columnValues.forEach((colVal, colIdx) => {
      const points: ScatterPoint[] = [];

      matrix.rowValues.forEach(rowVal => {
        const x = xValues[rowVal]?.[colVal] ?? 0;
        const y = yValues[rowVal]?.[colVal] ?? 0;
        points.push({ x, y, label: rowVal });
      });

      datasets.push({
        label: colVal,
        data: points,
        backgroundColor: colorPalette[colIdx % colorPalette.length],
        borderColor: colorPalette[colIdx % colorPalette.length],
        pointRadius: 5,
        pointHoverRadius: 8,
      });
    });

    return {
      datasets,
      rowFieldName: '',
      columnFieldName: '',
      measures: [xMeasure, yMeasure],
      selectedMeasure: xMeasure,
      allRowValues: matrix.rowValues,
      allColumnValues: matrix.columnValues,
      filteredRowValues: matrix.rowValues,
      filteredColumnValues: matrix.columnValues,
      xMeasure,
      yMeasure,
    };
  }

  /**
   * Convert chart data to sankey format
   */
  static toSankey(data: ChartData): SankeyChartData {
    const flows: SankeyFlow[] = [];

    data.labels.forEach((rowLabel, rowIdx) => {
      data.datasets.forEach(dataset => {
        const value = dataset.data[rowIdx] ?? 0;
        if (value > 0) {
          flows.push({
            from: rowLabel,
            to: dataset.label,
            flow: value,
          });
        }
      });
    });

    return {
      rowFieldName: data.rowFieldName,
      columnFieldName: data.columnFieldName,
      measures: data.measures,
      selectedMeasure: data.selectedMeasure,
      allRowValues: data.allRowValues,
      allColumnValues: data.allColumnValues,
      filteredRowValues: data.filteredRowValues,
      filteredColumnValues: data.filteredColumnValues,
      flows,
    };
  }

  /**
   * Convert data to histogram format with binning
   */
  static toHistogram(
    values: number[],
    numBins: number = 10,
    baseData?: Partial<ChartData>
  ): HistogramChartData {
    if (values.length === 0) {
      return {
        labels: [],
        rowFieldName: baseData?.rowFieldName ?? '',
        columnFieldName: baseData?.columnFieldName ?? '',
        measures: baseData?.measures ?? [],
        selectedMeasure: baseData?.selectedMeasure ?? {
          uniqueName: '',
          caption: '',
        },
        allRowValues: baseData?.allRowValues ?? [],
        allColumnValues: baseData?.allColumnValues ?? [],
        filteredRowValues: baseData?.filteredRowValues ?? [],
        filteredColumnValues: baseData?.filteredColumnValues ?? [],
        binLabels: [],
        binCounts: [],
        numBins: 0,
      };
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const binWidth = (maxVal - minVal) / numBins || 1;

    const bins: number[] = new Array(numBins).fill(0);
    const binLabels: string[] = [];

    // Create bin labels
    for (let i = 0; i < numBins; i++) {
      const binStart = minVal + i * binWidth;
      const binEnd = minVal + (i + 1) * binWidth;
      binLabels.push(`${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`);
    }

    // Count values in each bin
    values.forEach(val => {
      let binIndex = Math.floor((val - minVal) / binWidth);
      // Handle edge case for max value
      if (binIndex >= numBins) binIndex = numBins - 1;
      if (binIndex < 0) binIndex = 0;
      bins[binIndex]++;
    });

    return {
      labels: binLabels,
      rowFieldName: baseData?.rowFieldName ?? '',
      columnFieldName: baseData?.columnFieldName ?? '',
      measures: baseData?.measures ?? [],
      selectedMeasure: baseData?.selectedMeasure ?? {
        uniqueName: '',
        caption: '',
      },
      allRowValues: baseData?.allRowValues ?? [],
      allColumnValues: baseData?.allColumnValues ?? [],
      filteredRowValues: baseData?.filteredRowValues ?? [],
      filteredColumnValues: baseData?.filteredColumnValues ?? [],
      binLabels,
      binCounts: bins,
      numBins,
    };
  }

  /**
   * Build treemap data structure from flat data
   */
  static toTreemap(
    data: Array<Record<string, unknown>>,
    hierarchyFields: string[],
    valueField: string,
    colors?: string[]
  ): TreemapChartData {
    const colorPalette = colors ?? DEFAULT_CHART_COLORS;
    const tree: TreemapNode[] = [];
    const nodeMap = new Map<string, TreemapNode>();

    // Build tree structure
    data.forEach(item => {
      let currentLevel = tree;
      const path: string[] = [];

      hierarchyFields.forEach((field, depth) => {
        const fieldValue = String(item[field] ?? 'Unknown');
        path.push(fieldValue);
        const pathKey = path.join('/');

        let node = nodeMap.get(pathKey);
        if (!node) {
          node = {
            name: fieldValue,
            value: 0,
            children: depth < hierarchyFields.length - 1 ? [] : undefined,
            path: [...path],
            color: colorPalette[currentLevel.length % colorPalette.length],
          };
          nodeMap.set(pathKey, node);
          currentLevel.push(node);
        }

        // Add value at leaf level
        if (depth === hierarchyFields.length - 1) {
          node.value += Number(item[valueField]) || 0;
        }

        if (node.children) {
          currentLevel = node.children;
        }
      });
    });

    // Propagate values up the tree
    const propagateValues = (nodes: TreemapNode[]): number => {
      return nodes.reduce((sum, node) => {
        if (node.children && node.children.length > 0) {
          node.value = propagateValues(node.children);
        }
        return sum + node.value;
      }, 0);
    };

    const totalValue = propagateValues(tree);

    // Calculate max depth
    const getMaxDepth = (nodes: TreemapNode[], depth: number): number => {
      return nodes.reduce((max, node) => {
        if (node.children && node.children.length > 0) {
          return Math.max(max, getMaxDepth(node.children, depth + 1));
        }
        return Math.max(max, depth);
      }, depth);
    };

    const maxDepth = getMaxDepth(tree, 1);

    return {
      rowFieldName: hierarchyFields[0] ?? '',
      columnFieldName: '',
      measures: [{ uniqueName: valueField, caption: valueField }],
      selectedMeasure: { uniqueName: valueField, caption: valueField },
      allRowValues: [],
      allColumnValues: [],
      filteredRowValues: [],
      filteredColumnValues: [],
      tree,
      totalValue,
      hierarchyFields,
      maxDepth,
    };
  }

  /**
   * Flatten treemap data back to chart data format
   */
  static flattenTreemap(treemapData: TreemapChartData): ChartData {
    const labels: string[] = [];
    const values: number[] = [];

    const flatten = (nodes: TreemapNode[]) => {
      nodes.forEach(node => {
        if (!node.children || node.children.length === 0) {
          labels.push(node.path?.join(' > ') ?? node.name);
          values.push(node.value);
        } else {
          flatten(node.children);
        }
      });
    };

    flatten(treemapData.tree);

    return {
      labels,
      datasets: [
        {
          label: treemapData.selectedMeasure.caption,
          data: values,
          backgroundColor: DEFAULT_CHART_COLORS.slice(0, labels.length),
          borderColor: DEFAULT_CHART_BORDER_COLORS.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
      rowFieldName: treemapData.rowFieldName,
      columnFieldName: treemapData.columnFieldName,
      measures: treemapData.measures,
      selectedMeasure: treemapData.selectedMeasure,
      allRowValues: labels,
      allColumnValues: [],
      filteredRowValues: labels,
      filteredColumnValues: [],
    };
  }

  /**
   * Create combo chart data with primary and secondary series
   */
  static toCombo(
    data: ChartData,
    secondaryType: 'line' | 'area' = 'line'
  ): ChartData {
    if (data.datasets.length === 0) {
      return data;
    }

    // Calculate totals as secondary series
    const totals = data.labels.map((_, idx) =>
      data.datasets.reduce((sum, ds) => sum + (ds.data[idx] ?? 0), 0)
    );

    const primaryDatasets = data.datasets.map(ds => ({
      ...ds,
      type: 'bar' as const,
      order: 2,
    }));

    const secondaryDataset: ChartDataset = {
      label: 'Total',
      data: totals,
      type: secondaryType,
      backgroundColor:
        secondaryType === 'area' ? 'rgba(0, 0, 0, 0.1)' : undefined,
      borderColor: 'rgba(0, 0, 0, 0.8)',
      borderWidth: 2,
      fill: secondaryType === 'area',
      tension: 0.4,
      order: 1,
    };

    return {
      ...data,
      datasets: [...primaryDatasets, secondaryDataset],
    };
  }

  /**
   * Create stacked chart data
   */
  static toStacked(data: ChartData): ChartData {
    return {
      ...data,
      datasets: data.datasets.map(ds => ({
        ...ds,
        stack: 'stack1',
      })),
    };
  }

  /**
   * Transpose data (swap rows and columns)
   */
  static transpose(data: ChartData): ChartData {
    const newLabels = data.datasets.map(ds => ds.label);
    const newDatasets: ChartDataset[] = data.labels.map((label, idx) => ({
      label,
      data: data.datasets.map(ds => ds.data[idx] ?? 0),
      backgroundColor: DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length],
      borderColor:
        DEFAULT_CHART_BORDER_COLORS[idx % DEFAULT_CHART_BORDER_COLORS.length],
      borderWidth: 1,
    }));

    return {
      ...data,
      labels: newLabels,
      datasets: newDatasets,
      rowFieldName: data.columnFieldName,
      columnFieldName: data.rowFieldName,
      allRowValues: data.allColumnValues,
      allColumnValues: data.allRowValues,
      filteredRowValues: data.filteredColumnValues,
      filteredColumnValues: data.filteredRowValues,
    };
  }

  /**
   * Normalize data to percentages (0-100)
   */
  static normalize(
    data: ChartData,
    mode: 'row' | 'column' = 'column'
  ): ChartData {
    if (mode === 'column') {
      // Normalize each column (dataset) to sum to 100
      const newDatasets = data.datasets.map(ds => {
        const total = ds.data.reduce((sum, v) => sum + v, 0);
        return {
          ...ds,
          data: ds.data.map(v => (total > 0 ? (v / total) * 100 : 0)),
        };
      });
      return { ...data, datasets: newDatasets };
    } else {
      // Normalize each row to sum to 100
      const rowTotals = data.labels.map((_, idx) =>
        data.datasets.reduce((sum, ds) => sum + (ds.data[idx] ?? 0), 0)
      );
      const newDatasets = data.datasets.map(ds => ({
        ...ds,
        data: ds.data.map((v, idx) =>
          rowTotals[idx] > 0 ? (v / rowTotals[idx]) * 100 : 0
        ),
      }));
      return { ...data, datasets: newDatasets };
    }
  }
}

/**
 * Convenience function to transform matrix to datasets
 */
export function matrixToDatasets(
  matrix: DataMatrix,
  colors?: string[]
): { labels: string[]; datasets: ChartDataset[] } {
  return DataTransformer.toDatasets(matrix, colors);
}

/**
 * Convenience function to aggregate chart data
 */
export function aggregateChartData(
  data: ChartData,
  aggregation: 'sum' | 'avg' = 'sum'
): ChartData {
  return DataTransformer.aggregate(data, aggregation);
}
