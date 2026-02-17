/**
 * Base Chart Renderer
 * Abstract base class for chart renderer implementations
 */

import type {
  ChartInstance,
  ChartRenderer,
  ChartRenderOptions,
} from '../types/renderer-types';

/**
 * Abstract base class for chart renderers
 * Provides common functionality for all renderer implementations
 */
export abstract class BaseChartRenderer implements ChartRenderer {
  /**
   * Render a chart in the specified container
   */
  abstract render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance;

  /**
   * Update an existing chart with new data
   */
  abstract update(
    chart: ChartInstance,
    data: unknown,
    options?: ChartRenderOptions
  ): void;

  /**
   * Destroy a chart and clean up resources
   */
  abstract destroy(chart: ChartInstance): void;

  /**
   * Get the container element from a selector or element
   * @param container - CSS selector string or HTMLElement
   * @throws Error if container is not found
   */
  protected getContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) {
        throw new Error(`Container not found: ${container}`);
      }
      return el as HTMLElement;
    }
    return container;
  }

  /**
   * Create or get a canvas element inside the container
   * @param container - The container element
   * @param canvasId - Optional ID for the canvas
   */
  protected getOrCreateCanvas(
    container: HTMLElement,
    canvasId?: string
  ): HTMLCanvasElement {
    // Check if canvas already exists
    let canvas = container.querySelector('canvas') as HTMLCanvasElement | null;

    if (!canvas) {
      canvas = document.createElement('canvas');
      if (canvasId) {
        canvas.id = canvasId;
      }
      container.appendChild(canvas);
    }

    return canvas;
  }

  /**
   * Clear the container of all children
   * @param container - The container element to clear
   */
  protected clearContainer(container: HTMLElement): void {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}
