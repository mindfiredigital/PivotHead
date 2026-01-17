/**
 * Virtual Scrolling Manager for Large Datasets
 *
 * Efficiently renders only visible rows to handle 100k+ rows smoothly.
 * This is a framework-agnostic implementation that works with any DOM environment.
 *
 * @module VirtualScrollManager
 */

export interface VirtualScrollConfig {
  /** Container element for the virtual scroller */
  container: HTMLElement;
  /** Full dataset to render */
  data: any[];
  /** Fixed row height in pixels (default: 40) */
  rowHeight?: number;
  /** Number of extra rows to render for smooth scrolling (default: 10) */
  bufferSize?: number;
  /** Function to render a single row */
  renderRow: (item: any, index: number) => HTMLElement;
  /** Optional function to render the table header */
  renderHeader?: () => HTMLElement;
  /** Optional callback when visible range changes */
  onVisibleRangeChange?: (start: number, end: number) => void;
  /** Optional drag-drop handler */
  onDragDrop?: (fromIndex: number, toIndex: number) => void;
}

export interface VisibleRange {
  start: number;
  end: number;
}

/**
 * VirtualScrollManager - Efficient virtual scrolling implementation
 *
 * Renders only visible rows from a large dataset, dramatically improving
 * performance for datasets with thousands or millions of rows.
 *
 * @example
 * ```typescript
 * const scroller = new VirtualScrollManager({
 *   container: document.getElementById('table-container'),
 *   data: largeDataset,
 *   rowHeight: 40,
 *   bufferSize: 10,
 *   renderRow: (item, index) => createTableRow(item, index)
 * });
 * scroller.render();
 * ```
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private data: any[];
  private rowHeight: number;
  private bufferSize: number;
  private renderRow: (item: any, index: number) => HTMLElement;
  private renderHeader?: () => HTMLElement;
  private onVisibleRangeChange?: (start: number, end: number) => void;
  private onDragDrop?: (fromIndex: number, toIndex: number) => void;

  private scrollTop: number = 0;
  private visibleStart: number = 0;
  private visibleEnd: number = 0;
  private containerHeight: number = 0;

  private wrapper: HTMLElement | null = null;
  private spacer: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollRAF: number | null = null;

  constructor(config: VirtualScrollConfig) {
    this.container = config.container;
    this.data = config.data || [];
    this.rowHeight = config.rowHeight || 40;
    this.bufferSize = config.bufferSize || 10;
    this.renderRow = config.renderRow;
    this.renderHeader = config.renderHeader;
    this.onVisibleRangeChange = config.onVisibleRangeChange;
    this.onDragDrop = config.onDragDrop;

    this.init();
  }

  /**
   * Initialize the virtual scrolling structure
   * @private
   */
  private init(): void {
    if (!this.container) {
      console.error('VirtualScrollManager: Container not found');
      return;
    }

    // Create wrapper element
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'virtual-scroller-wrapper';
    this.wrapper.style.cssText = `
      position: relative;
      overflow-y: auto;
      overflow-x: auto;
      height: 600px;
      border: 1px solid #dee2e6;
    `;

    // Create spacer to maintain scroll height
    this.spacer = document.createElement('div');
    this.spacer.className = 'virtual-scroller-spacer';
    this.spacer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    `;

    // Create content container for visible rows
    this.content = document.createElement('div');
    this.content.className = 'virtual-scroller-content';
    this.content.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `;

    this.wrapper.appendChild(this.spacer);
    this.wrapper.appendChild(this.content);

    // Append wrapper to container
    this.container.appendChild(this.wrapper);

    // Add scroll listener with RAF throttling
    this.wrapper.addEventListener('scroll', () => this.handleScroll());

    // Add resize observer for responsive behavior
    this.resizeObserver = new ResizeObserver(() => {
      this.containerHeight = this.wrapper!.clientHeight;
      this.render();
    });
    this.resizeObserver.observe(this.wrapper);

    this.containerHeight = this.wrapper.clientHeight;
  }

  /**
   * Handle scroll events with requestAnimationFrame throttling
   * @private
   */
  private handleScroll(): void {
    if (this.scrollRAF !== null) {
      return; // Already scheduled
    }

    this.scrollRAF = requestAnimationFrame(() => {
      this.scrollRAF = null;
      this.onScroll();
    });
  }

  /**
   * Process scroll event
   * @private
   */
  private onScroll(): void {
    if (!this.wrapper) return;

    const newScrollTop = this.wrapper.scrollTop;

    // Only re-render if scrolled more than half a row height
    if (Math.abs(newScrollTop - this.scrollTop) > this.rowHeight / 2) {
      this.scrollTop = newScrollTop;
      this.render();
    }
  }

  /**
   * Calculate the range of visible rows
   * @returns Object with start and end indices
   */
  public getVisibleRange(): VisibleRange {
    const start = Math.floor(this.scrollTop / this.rowHeight);
    const end = Math.ceil(
      (this.scrollTop + this.containerHeight) / this.rowHeight
    );

    // Add buffer for smooth scrolling
    const bufferedStart = Math.max(0, start - this.bufferSize);
    const bufferedEnd = Math.min(this.data.length, end + this.bufferSize);

    return { start: bufferedStart, end: bufferedEnd };
  }

  /**
   * Render the visible rows
   */
  public render(): void {
    if (!this.data || this.data.length === 0 || !this.content || !this.spacer) {
      if (this.content) {
        this.content.innerHTML =
          '<div style="padding: 20px;">No data available</div>';
      }
      return;
    }

    const { start, end } = this.getVisibleRange();
    this.visibleStart = start;
    this.visibleEnd = end;

    // Notify listeners of range change
    if (this.onVisibleRangeChange) {
      this.onVisibleRangeChange(start, end);
    }

    // Update spacer height to match total content height
    const totalHeight = this.data.length * this.rowHeight + 50; // +50 for header
    this.spacer.style.height = `${totalHeight}px`;

    // Clear content
    this.content.innerHTML = '';

    // Create table
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    `;

    // Render header (sticky)
    if (this.renderHeader) {
      const thead = this.renderHeader();
      thead.style.cssText = `
        position: sticky;
        top: 0;
        z-index: 10;
        background: #f8f9fa;
      `;
      table.appendChild(thead);
    }

    // Render visible rows
    const tbody = document.createElement('tbody');
    tbody.style.transform = `translateY(${start * this.rowHeight}px)`;

    for (let i = start; i < end; i++) {
      if (i >= this.data.length) break;

      const row = this.renderRow(this.data[i], i);

      // Add drag-and-drop support if handler provided
      if (this.onDragDrop) {
        this.addDragDropSupport(row, i);
      }

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    this.content.appendChild(table);
  }

  /**
   * Add drag-and-drop support to a row
   * @private
   */
  private addDragDropSupport(row: HTMLElement, index: number): void {
    row.setAttribute('draggable', 'true');
    row.style.cursor = 'move';
    row.dataset.virtualIndex = String(index);

    row.addEventListener('dragstart', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
      }
      row.style.opacity = '0.5';
    });

    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
    });

    row.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    });

    row.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && this.onDragDrop) {
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = index;
        if (fromIndex !== toIndex) {
          this.onDragDrop(fromIndex, toIndex);
        }
      }
    });
  }

  /**
   * Update the dataset
   * @param data New dataset
   */
  public setData(data: any[]): void {
    this.data = data;
    this.scrollTop = 0;
    if (this.wrapper) {
      this.wrapper.scrollTop = 0;
    }
    this.render();
  }

  /**
   * Update row height
   * @param height New row height in pixels
   */
  public updateRowHeight(height: number): void {
    this.rowHeight = height;
    this.render();
  }

  /**
   * Scroll to a specific row index
   * @param index Row index to scroll to
   */
  public scrollToIndex(index: number): void {
    if (!this.wrapper) return;

    const targetScroll = index * this.rowHeight;
    this.wrapper.scrollTop = targetScroll;
    this.scrollTop = targetScroll;
    this.render();
  }

  /**
   * Scroll to the top
   */
  public scrollToTop(): void {
    this.scrollToIndex(0);
  }

  /**
   * Mount the virtual scroller to a parent element
   * @param parentElement Parent element to mount to
   */
  public mount(parentElement: HTMLElement): void {
    if (!this.wrapper) return;

    parentElement.innerHTML = '';
    parentElement.appendChild(this.wrapper);
    this.render();
  }

  /**
   * Refresh the current view
   */
  public refresh(): void {
    this.render();
  }

  /**
   * Get the current scroll position
   * @returns Current scroll top position
   */
  public getScrollTop(): number {
    return this.scrollTop;
  }

  /**
   * Get the total number of rows
   * @returns Total row count
   */
  public getRowCount(): number {
    return this.data.length;
  }

  /**
   * Get the current visible start and end indices
   * @returns Object with visibleStart and visibleEnd
   */
  public getVisibleIndices(): { visibleStart: number; visibleEnd: number } {
    return {
      visibleStart: this.visibleStart,
      visibleEnd: this.visibleEnd,
    };
  }

  /**
   * Clean up resources and remove event listeners
   */
  public destroy(): void {
    // Cancel any pending RAF
    if (this.scrollRAF !== null) {
      cancelAnimationFrame(this.scrollRAF);
      this.scrollRAF = null;
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove wrapper from DOM
    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }

    // Clear references
    this.wrapper = null;
    this.spacer = null;
    this.content = null;
    this.data = [];
  }
}
