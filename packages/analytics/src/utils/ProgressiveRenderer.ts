/**
 * ProgressiveRenderer - Renders charts progressively for large datasets
 * Provides chunked rendering with progress callbacks
 */

import type {
  ChartInstance,
  ChartRenderer,
  ChartRenderOptions,
} from '../types/renderer-types';
import type { ChartDataset } from '../types';

/**
 * Options for progressive rendering
 */
export interface ProgressiveRenderOptions {
  /** Number of data points to render per chunk */
  chunkSize: number;
  /** Delay between chunks in milliseconds */
  delayMs: number;
  /** Callback for progress updates (0-100) */
  onProgress?: (percent: number) => void;
  /** Callback when rendering is complete */
  onComplete?: () => void;
  /** Callback if rendering is cancelled */
  onCancel?: () => void;
  /** Callback if an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Default options for progressive rendering
 */
const DEFAULT_OPTIONS: ProgressiveRenderOptions = {
  chunkSize: 100,
  delayMs: 16, // ~60fps
};

/**
 * Render state for tracking progress
 */
interface RenderState {
  isRendering: boolean;
  isCancelled: boolean;
  currentChunk: number;
  totalChunks: number;
  chart: ChartInstance | null;
}

/**
 * ProgressiveRenderer class for chunked chart rendering
 */
export class ProgressiveRenderer {
  private renderer: ChartRenderer;
  private options: ProgressiveRenderOptions;
  private state: RenderState = {
    isRendering: false,
    isCancelled: false,
    currentChunk: 0,
    totalChunks: 0,
    chart: null,
  };

  constructor(
    renderer: ChartRenderer,
    options: Partial<ProgressiveRenderOptions> = {}
  ) {
    this.renderer = renderer;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Update options
   */
  setOptions(options: Partial<ProgressiveRenderOptions>): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Get current options
   */
  getOptions(): ProgressiveRenderOptions {
    return { ...this.options };
  }

  /**
   * Check if currently rendering
   */
  isRendering(): boolean {
    return this.state.isRendering;
  }

  /**
   * Get current progress (0-100)
   */
  getProgress(): number {
    if (this.state.totalChunks === 0) return 0;
    return Math.round((this.state.currentChunk / this.state.totalChunks) * 100);
  }

  /**
   * Cancel ongoing rendering
   */
  cancel(): void {
    if (this.state.isRendering) {
      this.state.isCancelled = true;
    }
  }

  /**
   * Render data progressively in chunks
   */
  async render(
    container: HTMLElement | string,
    data: {
      labels?: string[];
      datasets?: ChartDataset[];
      [key: string]: unknown;
    },
    options: ChartRenderOptions
  ): Promise<ChartInstance | null> {
    // Check if already rendering
    if (this.state.isRendering) {
      throw new Error('Already rendering. Call cancel() first.');
    }

    const { chunkSize, delayMs, onProgress, onComplete, onCancel, onError } =
      this.options;

    // Reset state
    this.state = {
      isRendering: true,
      isCancelled: false,
      currentChunk: 0,
      totalChunks: 0,
      chart: null,
    };

    try {
      const datasets = data.datasets || [];

      // Calculate total data points and chunks
      const totalPoints = datasets.reduce(
        (sum, ds) => sum + (ds.data?.length || 0),
        0
      );
      const totalChunks = Math.ceil(totalPoints / chunkSize);
      this.state.totalChunks = totalChunks;

      // If data is small, render directly
      if (totalPoints <= chunkSize) {
        const chart = this.renderer.render(container, data, options);
        this.state.chart = chart;
        this.state.isRendering = false;
        onProgress?.(100);
        onComplete?.();
        return chart;
      }

      // Initial render with first chunk
      const firstChunkData = this.getChunkData(data, 0, chunkSize);
      const chart = this.renderer.render(container, firstChunkData, options);
      this.state.chart = chart;
      this.state.currentChunk = 1;
      onProgress?.(this.getProgress());

      // Progressive updates
      let pointsRendered = chunkSize;

      while (pointsRendered < totalPoints) {
        // Check for cancellation
        if (this.state.isCancelled) {
          this.state.isRendering = false;
          onCancel?.();
          return chart;
        }

        // Wait for next frame
        await this.delay(delayMs);

        // Render next chunk
        const nextChunkEnd = Math.min(pointsRendered + chunkSize, totalPoints);
        const chunkData = this.getChunkData(data, 0, nextChunkEnd);

        this.renderer.update(chart, chunkData);

        pointsRendered = nextChunkEnd;
        this.state.currentChunk++;
        onProgress?.(this.getProgress());
      }

      this.state.isRendering = false;
      onProgress?.(100);
      onComplete?.();
      return chart;
    } catch (error) {
      this.state.isRendering = false;
      onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get a slice of data up to the specified end point
   */
  private getChunkData(
    data: {
      labels?: string[];
      datasets?: ChartDataset[];
      [key: string]: unknown;
    },
    _start: number,
    end: number
  ): typeof data {
    const datasets = data.datasets || [];
    const labels = data.labels || [];

    // Calculate how many points per dataset
    let remainingPoints = end;
    const newDatasets: ChartDataset[] = [];

    for (const ds of datasets) {
      const dsLength = ds.data?.length || 0;
      const pointsToInclude = Math.min(remainingPoints, dsLength);

      if (pointsToInclude > 0) {
        newDatasets.push({
          ...ds,
          data: ds.data?.slice(0, pointsToInclude) || [],
        });
        remainingPoints -= pointsToInclude;
      }

      if (remainingPoints <= 0) break;
    }

    // Calculate how many labels to include
    const maxDatasetLength = Math.max(
      ...newDatasets.map(ds => ds.data?.length || 0),
      0
    );
    const newLabels = labels.slice(0, maxDatasetLength);

    return {
      ...data,
      labels: newLabels,
      datasets: newDatasets,
    };
  }

  /**
   * Delay helper for async rendering
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current chart instance
   */
  getChart(): ChartInstance | null {
    return this.state.chart;
  }

  /**
   * Destroy the current chart
   */
  destroy(): void {
    if (this.state.chart) {
      this.renderer.destroy(this.state.chart);
      this.state.chart = null;
    }
    this.state.isRendering = false;
    this.state.isCancelled = false;
  }
}

/**
 * Create a progressive renderer
 */
export function createProgressiveRenderer(
  renderer: ChartRenderer,
  options?: Partial<ProgressiveRenderOptions>
): ProgressiveRenderer {
  return new ProgressiveRenderer(renderer, options);
}

/**
 * Render chart progressively (convenience function)
 */
export async function renderProgressively(
  renderer: ChartRenderer,
  container: HTMLElement | string,
  data: {
    labels?: string[];
    datasets?: ChartDataset[];
    [key: string]: unknown;
  },
  options: ChartRenderOptions,
  progressOptions?: Partial<ProgressiveRenderOptions>
): Promise<ChartInstance | null> {
  const progressiveRenderer = new ProgressiveRenderer(
    renderer,
    progressOptions
  );
  return progressiveRenderer.render(container, data, options);
}
