/**
 * D3.js Renderer
 * Implements ChartRenderer interface for D3.js library
 * Provides low-level SVG-based rendering
 */

import { BaseChartRenderer } from './BaseChartRenderer';
import type {
  ChartInstance,
  ChartRenderOptions,
} from '../types/renderer-types';
import type { FormatConfig, ChartClickData } from '../types/config-types';
import { ColorManager } from '../utils/ColorPalettes';
import type { ColorPaletteName } from '../utils/ColorPalettes';

// Type definitions for D3 (minimal, to avoid hard dependency)
// Using 'any' for D3 methods that have complex overloads
/* eslint-disable @typescript-eslint/no-explicit-any */
type D3Selection = {
  append(name: string): D3Selection;
  attr(name: string, value: any): D3Selection;
  style(name: string, value: any): D3Selection;
  text(value: any): D3Selection;
  selectAll(selector: string): D3Selection;
  data(data: any[]): D3Selection;
  datum(data: any): D3Selection;
  join(enter: string): D3Selection;
  enter(): D3Selection;
  exit(): D3Selection;
  remove(): void;
  call(fn: any, ...args: any[]): D3Selection;
  on(event: string, handler: any): D3Selection;
  transition(): D3Selection;
  duration(ms: number): D3Selection;
  node(): SVGElement | null;
  select(selector: string): D3Selection;
  html(value: string): D3Selection;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
interface D3Scale {
  (value: any): number;
  domain(values: any[]): D3Scale;
  range(values: number[]): D3Scale;
  bandwidth?(): number;
  padding?(value: number): D3Scale;
  nice?(): D3Scale;
}

interface D3Axis {
  (selection: D3Selection): void;
  scale(scale: D3Scale): D3Axis;
  tickFormat?(format: any): D3Axis;
  ticks?(count: number): D3Axis;
  tickSize?(size: number): D3Axis;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
interface D3Arc {
  innerRadius(r: number): D3Arc;
  outerRadius(r: number): D3Arc;
  (d: any): string;
}

interface D3Pie {
  value(accessor: (d: any) => number): D3Pie;
  sort(comparator: null | ((a: any, b: any) => number)): D3Pie;
  (data: any[]): any[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
interface D3Static {
  select(selector: string | Element): D3Selection;
  selectAll(selector: string): D3Selection;
  scaleBand(): D3Scale;
  scaleLinear(): D3Scale;
  scaleOrdinal(): D3Scale;
  axisBottom(scale: D3Scale): D3Axis;
  axisLeft(scale: D3Scale): D3Axis;
  arc(): D3Arc;
  pie(): D3Pie;
  max(data: any[], accessor?: (d: any) => number): number;
  min(data: any[], accessor?: (d: any) => number): number;
  line(): any;
  area(): any;
  curveMonotoneX: any;
  treemap(): any;
  hierarchy(data: any): any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Dynamically get D3
function getD3(): D3Static {
  // Check for global d3
  const globalD3 = (globalThis as Record<string, unknown>).d3 as
    | D3Static
    | undefined;
  if (globalD3) {
    return globalD3;
  }

  // Try to require d3 (for Node.js/bundler environments)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('d3') as D3Static;
  } catch {
    throw new Error('D3 library not found. Please install d3: npm install d3');
  }
}

/**
 * D3 specific instance wrapper
 */
class D3InstanceWrapper implements ChartInstance {
  private svg: D3Selection | null = null;

  constructor(private container: HTMLElement) {}

  setSvg(svg: D3Selection): void {
    this.svg = svg;
  }

  update(data?: unknown): void {
    // D3 updates are complex and chart-type specific
    // For now, trigger a full re-render by storing callback
    if (this.svg && data) {
      // Clear and let the main render handle it
      const d3 = getD3();
      d3.select(this.container).selectAll('*').remove();
    }
  }

  destroy(): void {
    if (this.container) {
      const d3 = getD3();
      d3.select(this.container).selectAll('*').remove();
    }
  }

  resize(): void {
    // D3 doesn't have built-in resize - would need to re-render
    // Store dimensions and re-render on resize
  }

  getCanvas(): HTMLCanvasElement | null {
    // D3 uses SVG, not canvas
    return null;
  }

  getD3Selection(): D3Selection | null {
    return this.svg;
  }
}

/**
 * D3.js renderer implementation
 */
export class D3Renderer extends BaseChartRenderer {
  private colorManager: ColorManager;

  constructor() {
    super();
    this.colorManager = new ColorManager('tableau10');
  }

  /**
   * Render a chart using D3
   */
  render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance {
    const d3 = getD3();
    const containerEl = this.getContainer(container);

    // Clear container
    this.clearContainer(containerEl);

    // Set color palette if specified
    if (options.style?.colorScheme) {
      this.colorManager.setPalette(
        options.style.colorScheme as ColorPaletteName
      );
    }

    // Get dimensions
    const margin = options.d3Options?.margin || {
      top: 40,
      right: 30,
      bottom: 50,
      left: 60,
    };
    const containerWidth =
      options.style?.width === 'auto' || !options.style?.width
        ? containerEl.clientWidth || 600
        : options.style.width;
    const containerHeight = options.style?.height || 400;
    const width = containerWidth - (margin.left || 0) - (margin.right || 0);
    const height = containerHeight - (margin.top || 0) - (margin.bottom || 0);

    // Create SVG
    const svg = d3
      .select(containerEl)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left || 0},${margin.top || 0})`);

    // Add title if specified
    if (options.style?.title) {
      d3.select(containerEl)
        .select('svg')
        .append('text')
        .attr('x', containerWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(options.style.title);
    }

    // Render based on chart type
    switch (options.type) {
      case 'pie':
      case 'doughnut':
        this.renderPie(svg, data, options, width, height);
        break;
      case 'line':
      case 'area':
      case 'stackedArea':
        this.renderLine(svg, data, options, width, height);
        break;
      case 'scatter':
        this.renderScatter(svg, data, options, width, height);
        break;
      case 'heatmap':
        this.renderHeatmap(svg, data, options, width, height);
        break;
      case 'treemap':
        this.renderTreemap(svg, data, options, width, height);
        break;
      default:
        this.renderBar(svg, data, options, width, height);
    }

    const instance = new D3InstanceWrapper(containerEl);
    instance.setSvg(svg);
    return instance;
  }

  /**
   * Update an existing chart with new data
   */
  update(
    chart: ChartInstance,
    data: unknown,
    _options?: import('../types/renderer-types').ChartRenderOptions
  ): void {
    chart.update(data);
  }

  /**
   * Destroy a chart and clean up resources
   */
  destroy(chart: ChartInstance): void {
    chart.destroy();
  }

  /**
   * Render a bar/column chart
   */
  private renderBar(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
    };

    const labels = chartData.labels || [];
    const datasets = chartData.datasets || [];
    const isStacked = options.type?.includes('stacked');

    // Prepare data for grouped/stacked bars
    const groupedData: Array<{
      label: string;
      values: Array<{ key: string; value: number }>;
    }> = labels.map((label, idx) => ({
      label,
      values: datasets.map(ds => ({
        key: ds.label || '',
        value: ds.data?.[idx] || 0,
      })),
    }));

    // Calculate max value
    let maxValue: number;
    if (isStacked) {
      maxValue =
        d3.max(groupedData, d =>
          d.values.reduce(
            (sum: number, v: { value: number }) => sum + v.value,
            0
          )
        ) || 0;
    } else {
      maxValue =
        d3.max(groupedData, d => d3.max(d.values, v => v.value) || 0) || 0;
    }

    // Create scales
    const x0 = d3.scaleBand().range([0, width]);
    x0.padding?.(0.1);
    const x1 = d3.scaleBand();
    x1.padding?.(0.05);
    const y = d3.scaleLinear().range([height, 0]);
    y.nice?.();

    x0.domain(labels);
    x1.domain(datasets.map(d => d.label || '')).range([
      0,
      x0.bandwidth ? x0.bandwidth() : 0,
    ]);
    y.domain([0, maxValue * 1.1]);

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0) as unknown as (selection: D3Selection) => void);

    // Add Y axis
    const yAxis = d3.axisLeft(y);
    if (options.format) {
      yAxis.tickFormat?.((value: unknown) =>
        this.formatValue(value as number, options.format)
      );
    }
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis as unknown as (selection: D3Selection) => void);

    // Add grid lines if enabled
    if (options.style?.showGrid !== false) {
      svg
        .append('g')
        .attr('class', 'grid')
        .call(
          (() => {
            const axis = d3.axisLeft(y);
            axis.tickSize?.(-width);
            axis.tickFormat?.(() => '');
            return axis;
          })()
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.3);
    }

    // Create bar groups
    const barGroups = svg
      .selectAll('.bar-group')
      .data(groupedData)
      .join('g')
      .attr('class', 'bar-group')
      .attr(
        'transform',
        (d: { label: string }) => `translate(${x0(d.label)},0)`
      );

    if (isStacked) {
      // Stacked bars
      let cumulative: number[] = new Array(labels.length).fill(0);

      datasets.forEach((ds, dsIndex) => {
        barGroups
          .selectAll(`.bar-${dsIndex}`)
          .data(((d: { values: Array<{ value: number }> }, i: number) => [
            { value: d.values[dsIndex]?.value || 0, index: i },
          ]) as unknown as unknown[])
          .join('rect')
          .attr('class', `bar-${dsIndex}`)
          .attr('x', 0)
          .attr('y', (d: { value: number; index: number }) =>
            y(cumulative[d.index] + d.value)
          )
          .attr('width', x0.bandwidth ? x0.bandwidth() : 0)
          .attr(
            'height',
            (d: { value: number; index: number }) => height - y(d.value)
          )
          .attr('fill', this.colorManager.getColor(dsIndex))
          .on('click', (_event: Event, d: { value: number; index: number }) => {
            if (options.interactions?.click) {
              const clickData: ChartClickData = {
                rowValue: labels[d.index],
                columnValue: ds.label,
                value: d.value,
                datasetIndex: dsIndex,
                index: d.index,
              };
              options.interactions.click(clickData);
            }
          });

        // Update cumulative
        groupedData.forEach((gd, i) => {
          cumulative[i] += gd.values[dsIndex]?.value || 0;
        });
      });
    } else {
      // Grouped bars
      barGroups
        .selectAll('rect')
        .data(
          ((d: { values: Array<{ key: string; value: number }> }) =>
            d.values) as unknown as unknown[]
        )
        .join('rect')
        .attr('x', (d: { key: string }) => x1(d.key) || 0)
        .attr('y', (d: { value: number }) => y(d.value))
        .attr('width', x1.bandwidth ? x1.bandwidth() : 0)
        .attr('height', (d: { value: number }) => height - y(d.value))
        .attr('fill', (_d: unknown, i: number) => this.colorManager.getColor(i))
        .on('click', (event: Event, d: { key: string; value: number }) => {
          if (options.interactions?.click) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parentData = (
              (event.target as SVGElement).parentElement as any
            )?.__data__ as { label: string } | undefined;
            const clickData: ChartClickData = {
              rowValue: parentData?.label,
              columnValue: d.key,
              value: d.value,
            };
            options.interactions.click(clickData);
          }
        });
    }

    // Add legend
    if (options.style?.showLegend !== false && datasets.length > 1) {
      this.addLegend(
        svg,
        datasets.map(d => d.label || ''),
        width
      );
    }
  }

  /**
   * Render a line/area chart
   */
  private renderLine(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
    };

    const labels = chartData.labels || [];
    const datasets = chartData.datasets || [];
    const isArea = options.type === 'area' || options.type === 'stackedArea';

    // Find max value
    const maxValue = d3.max(datasets, ds => d3.max(ds.data || []) || 0) || 0;

    // Create scales
    const x = d3.scaleBand().range([0, width]);
    x.padding?.(0);
    const y = d3.scaleLinear().range([height, 0]);
    y.nice?.();

    x.domain(labels);
    y.domain([0, maxValue * 1.1]);

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x) as unknown as (selection: D3Selection) => void);

    // Add Y axis
    const yAxis = d3.axisLeft(y);
    if (options.format) {
      yAxis.tickFormat?.((value: unknown) =>
        this.formatValue(value as number, options.format)
      );
    }
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis as unknown as (selection: D3Selection) => void);

    // Add grid lines if enabled
    if (options.style?.showGrid !== false) {
      svg
        .append('g')
        .attr('class', 'grid')
        .call(
          (() => {
            const axis = d3.axisLeft(y);
            axis.tickSize?.(-width);
            axis.tickFormat?.(() => '');
            return axis;
          })()
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.3);
    }

    // Draw lines/areas
    const bandwidth = x.bandwidth ? x.bandwidth() : 0;
    datasets.forEach((ds, index) => {
      const lineData = (ds.data || []).map((value, i) => ({
        x: (x(labels[i]) || 0) + bandwidth / 2,
        y: y(value),
        value,
        label: labels[i],
      }));

      if (isArea) {
        // Draw area
        const area = d3
          .area()
          .x((d: unknown) => (d as { x: number }).x)
          .y0(height)
          .y1((d: unknown) => (d as { y: number }).y);

        if (area.curve) {
          area.curve(d3.curveMonotoneX);
        }

        svg
          .append('path')
          .datum(lineData)
          .attr('fill', this.colorManager.getColor(index))
          .attr('fill-opacity', 0.3)
          .attr('d', area as unknown as string);
      }

      // Draw line
      const line = d3
        .line()
        .x((d: unknown) => (d as { x: number }).x)
        .y((d: unknown) => (d as { y: number }).y);

      if (line.curve) {
        line.curve(d3.curveMonotoneX);
      }

      svg
        .append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', this.colorManager.getColor(index))
        .attr('stroke-width', 2)
        .attr('d', line as unknown as string);

      // Add data points
      svg
        .selectAll(`.point-${index}`)
        .data(lineData)
        .join('circle')
        .attr('class', `point-${index}`)
        .attr('cx', (d: { x: number }) => d.x)
        .attr('cy', (d: { y: number }) => d.y)
        .attr('r', 4)
        .attr('fill', this.colorManager.getColor(index))
        .style('cursor', 'pointer')
        .on('click', (_event: Event, d: { value: number; label: string }) => {
          if (options.interactions?.click) {
            const clickData: ChartClickData = {
              rowValue: d.label,
              columnValue: ds.label,
              value: d.value,
              datasetIndex: index,
            };
            options.interactions.click(clickData);
          }
        });
    });

    // Add legend
    if (options.style?.showLegend !== false && datasets.length > 1) {
      this.addLegend(
        svg,
        datasets.map(d => d.label || ''),
        width
      );
    }
  }

  /**
   * Render a pie/doughnut chart
   */
  private renderPie(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    };

    const labels = chartData.labels || [];
    const values = chartData.datasets?.[0]?.data || [];
    const isDoughnut = options.type === 'doughnut';

    const radius = Math.min(width, height) / 2;
    const innerRadius = isDoughnut ? radius * 0.5 : 0;

    // Move to center
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create pie generator
    const pie = d3
      .pie()
      .value((d: unknown) => (d as { value: number }).value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    // Prepare data
    const pieData = labels.map((label, i) => ({
      label,
      value: values[i] || 0,
    }));

    // Draw slices
    g.selectAll('.slice')
      .data(pie(pieData))
      .join('path')
      .attr('class', 'slice')
      .attr('d', arc as unknown as string)
      .attr('fill', (_d: unknown, i: number) => this.colorManager.getColor(i))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on(
        'click',
        (
          _event: Event,
          d: { data: { label: string; value: number }; index: number }
        ) => {
          if (options.interactions?.click) {
            const clickData: ChartClickData = {
              rowValue: d.data.label,
              value: d.data.value,
              index: d.index,
            };
            options.interactions.click(clickData);
          }
        }
      );

    // Add labels
    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    g.selectAll('.label')
      .data(pie(pieData))
      .join('text')
      .attr('class', 'label')
      .attr(
        'transform',
        (d: { startAngle: number; endAngle: number }) =>
          `translate(${labelArc(d)})`
      )
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text((d: { data: { label: string; value: number } }) => {
        const total = values.reduce((sum, v) => sum + v, 0);
        const percent =
          total > 0 ? ((d.data.value / total) * 100).toFixed(1) : 0;
        return `${percent}%`;
      });

    // Add legend
    if (options.style?.showLegend !== false) {
      this.addLegend(svg, labels, width);
    }
  }

  /**
   * Render a scatter chart
   */
  private renderScatter(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      datasets?: Array<{
        label?: string;
        data?: Array<{ x: number; y: number; label?: string }>;
      }>;
    };

    const datasets = chartData.datasets || [];

    // Find min/max values
    const allPoints = datasets.flatMap(ds => ds.data || []);
    const xMin = d3.min(allPoints, p => p.x) || 0;
    const xMax = d3.max(allPoints, p => p.x) || 0;
    const yMin = d3.min(allPoints, p => p.y) || 0;
    const yMax = d3.max(allPoints, p => p.y) || 0;

    // Create scales
    const x = d3.scaleLinear().range([0, width]);
    x.nice?.();
    const y = d3.scaleLinear().range([height, 0]);
    y.nice?.();

    x.domain([xMin * 0.9, xMax * 1.1]);
    y.domain([yMin * 0.9, yMax * 1.1]);

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x) as unknown as (selection: D3Selection) => void);

    // Add Y axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y) as unknown as (selection: D3Selection) => void);

    // Add grid lines if enabled
    if (options.style?.showGrid !== false) {
      svg
        .append('g')
        .attr('class', 'grid-x')
        .attr('transform', `translate(0,${height})`)
        .call(
          (() => {
            const axis = d3.axisBottom(x);
            axis.tickSize?.(-height);
            axis.tickFormat?.(() => '');
            return axis;
          })()
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.3);

      svg
        .append('g')
        .attr('class', 'grid-y')
        .call(
          (() => {
            const axis = d3.axisLeft(y);
            axis.tickSize?.(-width);
            axis.tickFormat?.(() => '');
            return axis;
          })()
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.3);
    }

    // Draw points
    datasets.forEach((ds, index) => {
      svg
        .selectAll(`.point-${index}`)
        .data(ds.data || [])
        .join('circle')
        .attr('class', `point-${index}`)
        .attr('cx', (d: { x: number }) => x(d.x))
        .attr('cy', (d: { y: number }) => y(d.y))
        .attr('r', 6)
        .attr('fill', this.colorManager.getColor(index))
        .attr('fill-opacity', 0.7)
        .style('cursor', 'pointer')
        .on(
          'click',
          (_event: Event, d: { x: number; y: number; label?: string }) => {
            if (options.interactions?.click) {
              const clickData: ChartClickData = {
                rowValue: d.label,
                columnValue: ds.label,
                value: d.y,
                datasetIndex: index,
              };
              options.interactions.click(clickData);
            }
          }
        );
    });

    // Add legend
    if (options.style?.showLegend !== false && datasets.length > 1) {
      this.addLegend(
        svg,
        datasets.map(d => d.label || ''),
        width
      );
    }
  }

  /**
   * Render a heatmap chart
   */
  private renderHeatmap(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
      cells?: Array<{ x: number | string; y: number | string; value: number }>;
    };

    const yLabels = chartData.labels || [];
    const xLabels = chartData.datasets?.map(ds => ds.label || '') || [];

    // Build cells
    const cells: Array<{
      x: number;
      y: number;
      value: number;
      xLabel: string;
      yLabel: string;
    }> = [];
    if (chartData.cells) {
      chartData.cells.forEach(cell => {
        cells.push({
          x:
            typeof cell.x === 'number'
              ? cell.x
              : xLabels.indexOf(cell.x as string),
          y:
            typeof cell.y === 'number'
              ? cell.y
              : yLabels.indexOf(cell.y as string),
          value: cell.value,
          xLabel: typeof cell.x === 'string' ? cell.x : xLabels[cell.x] || '',
          yLabel: typeof cell.y === 'string' ? cell.y : yLabels[cell.y] || '',
        });
      });
    } else {
      chartData.datasets?.forEach((ds, xIdx) => {
        ds.data?.forEach((value, yIdx) => {
          cells.push({
            x: xIdx,
            y: yIdx,
            value,
            xLabel: ds.label || '',
            yLabel: yLabels[yIdx] || '',
          });
        });
      });
    }

    // Find min/max values
    const minValue = d3.min(cells, c => c.value) || 0;
    const maxValue = d3.max(cells, c => c.value) || 1;

    // Create scales
    const x = d3.scaleBand().range([0, width]);
    x.padding?.(0.05);
    const y = d3.scaleBand().range([0, height]);
    y.padding?.(0.05);

    x.domain(xLabels);
    y.domain(yLabels);

    // Color scale
    const colorScale = (value: number): string => {
      const ratio = (value - minValue) / (maxValue - minValue || 1);
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * (1 - ratio * 0.5));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    };

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x) as unknown as (selection: D3Selection) => void);

    // Add Y axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y) as unknown as (selection: D3Selection) => void);

    // Draw cells
    svg
      .selectAll('.cell')
      .data(cells)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (d: { xLabel: string }) => x(d.xLabel) || 0)
      .attr('y', (d: { yLabel: string }) => y(d.yLabel) || 0)
      .attr('width', x.bandwidth ? x.bandwidth() : 0)
      .attr('height', y.bandwidth ? y.bandwidth() : 0)
      .attr('fill', (d: { value: number }) => colorScale(d.value))
      .style('cursor', 'pointer')
      .on(
        'click',
        (
          _event: Event,
          d: {
            xLabel: string;
            yLabel: string;
            value: number;
            x: number;
            y: number;
          }
        ) => {
          if (options.interactions?.click) {
            const clickData: ChartClickData = {
              rowValue: d.yLabel,
              columnValue: d.xLabel,
              value: d.value,
              index: d.y,
              datasetIndex: d.x,
            };
            options.interactions.click(clickData);
          }
        }
      );

    // Add value labels if enabled
    if (options.style?.showValues !== false) {
      svg
        .selectAll('.cell-label')
        .data(cells)
        .join('text')
        .attr('class', 'cell-label')
        .attr(
          'x',
          (d: { xLabel: string }) =>
            (x(d.xLabel) || 0) + (x.bandwidth ? x.bandwidth() / 2 : 0)
        )
        .attr(
          'y',
          (d: { yLabel: string }) =>
            (y(d.yLabel) || 0) + (y.bandwidth ? y.bandwidth() / 2 : 0)
        )
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('fill', (d: { value: number }) => {
          const ratio = (d.value - minValue) / (maxValue - minValue || 1);
          return ratio > 0.5 ? 'white' : 'black';
        })
        .text((d: { value: number }) =>
          this.formatValue(d.value, options.format)
        );
    }
  }

  /**
   * Render a treemap chart
   */
  private renderTreemap(
    svg: D3Selection,
    data: unknown,
    options: ChartRenderOptions,
    width: number,
    height: number
  ): void {
    const d3 = getD3();
    const chartData = data as {
      tree?: Array<{ name: string; value: number; children?: unknown[] }>;
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    };

    // Build hierarchy data
    let hierarchyData: {
      name: string;
      children: Array<{ name: string; value: number }>;
    };

    if (chartData.tree) {
      hierarchyData = {
        name: 'root',
        children: chartData.tree as Array<{ name: string; value: number }>,
      };
    } else {
      hierarchyData = {
        name: 'root',
        children: (chartData.labels || []).map((label, idx) => ({
          name: label,
          value: chartData.datasets?.[0]?.data?.[idx] || 0,
        })),
      };
    }

    // Create treemap layout
    const treemap = d3.treemap().size([width, height]).padding(2);

    // Create hierarchy and compute layout
    const root = d3
      .hierarchy(hierarchyData)
      .sum((d: unknown) => (d as { value?: number }).value || 0);

    treemap(root);

    // Draw rectangles
    const leaves = root.leaves();

    svg
      .selectAll('.treemap-cell')
      .data(leaves)
      .join('rect')
      .attr('class', 'treemap-cell')
      .attr('x', (d: { x0: number }) => d.x0)
      .attr('y', (d: { y0: number }) => d.y0)
      .attr('width', (d: { x1: number; x0: number }) => d.x1 - d.x0)
      .attr('height', (d: { y1: number; y0: number }) => d.y1 - d.y0)
      .attr('fill', (_d: unknown, i: number) => this.colorManager.getColor(i))
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on(
        'click',
        (_event: Event, d: { data: { name: string; value: number } }) => {
          if (options.interactions?.click) {
            const clickData: ChartClickData = {
              rowValue: d.data.name,
              value: d.data.value,
            };
            options.interactions.click(clickData);
          }
        }
      );

    // Add labels
    svg
      .selectAll('.treemap-label')
      .data(leaves)
      .join('text')
      .attr('class', 'treemap-label')
      .attr('x', (d: { x0: number; x1: number }) => d.x0 + (d.x1 - d.x0) / 2)
      .attr('y', (d: { y0: number; y1: number }) => d.y0 + (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text((d: { data: { name: string }; x1: number; x0: number }) => {
        // Only show label if cell is big enough
        return d.x1 - d.x0 > 40 ? d.data.name : '';
      });
  }

  /**
   * Add a legend to the chart
   */
  private addLegend(svg: D3Selection, labels: string[], width: number): void {
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 10}, 0)`);

    labels.forEach((label, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

      g.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', this.colorManager.getColor(i));

      g.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(label);
    });
  }

  /**
   * Format a numeric value based on format configuration
   */
  private formatValue(value: number, format?: FormatConfig): string {
    if (value === undefined || value === null) return '';

    const locale = format?.locale || 'en-US';
    const decimals = format?.decimals ?? 0;
    const prefix = format?.prefix || '';
    const suffix = format?.suffix || '';

    let formattedValue: string;

    switch (format?.valueFormat) {
      case 'currency':
        formattedValue = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: format.currency || 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
        break;

      case 'percent':
        formattedValue = new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value / 100);
        break;

      case 'compact':
        formattedValue = new Intl.NumberFormat(locale, {
          notation: 'compact',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
        break;

      default:
        formattedValue = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
    }

    return `${prefix}${formattedValue}${suffix}`;
  }
}
