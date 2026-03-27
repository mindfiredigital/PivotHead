'use strict';

/** Default height of a single data row in pixels. */
const DEFAULT_ROW_HEIGHT = 40;

/** Extra rows rendered above/below the visible area for smooth scrolling. */
const DEFAULT_BUFFER_SIZE = 10;

/** Default visible height of the scroller container in pixels. */
const DEFAULT_SCROLLER_HEIGHT_PX = 600;

/** Approximate height reserved for the sticky table header in pixels. */
const HEADER_HEIGHT_PX = 50;

/**
 * Returns a debounced version of `fn` that delays invocation by `delayMs`.
 * Only the last call within the delay window is executed.
 *
 * @param {Function} fn
 * @param {number} delayMs
 * @returns {Function}
 */
function debounce(fn, delayMs) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delayMs);
  };
}

/**
 * Virtual Scrolling Implementation for Large Datasets
 * Efficiently renders only visible rows to handle 100k+ rows smoothly
 */

import { logger } from '../../logger.js';

export class VirtualScroller {
  constructor(config) {
    this.container = config.container;
    this.data = config.data || [];
    this.headers = config.headers || [];
    this.rowHeight = config.rowHeight || DEFAULT_ROW_HEIGHT;
    this.bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE; // Extra rows to render for smooth scrolling
    this.renderRow = config.renderRow; // Function to render a single row
    this.renderHeader = config.renderHeader; // Function to render header
    this.onDragDrop = config.onDragDrop; // Callback for drag/drop events

    this.scrollTop = 0;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.containerHeight = 0;

    this.init();
  }

  init() {
    if (!this.container) {
      logger.error('VirtualScroller: Container not found');
      return;
    }

    // Create virtual scrolling structure
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'virtual-scroller-wrapper';
    this.wrapper.style.cssText = `
      position: relative;
      overflow-y: auto;
      overflow-x: auto;
      height: ${DEFAULT_SCROLLER_HEIGHT_PX}px;
      border: 1px solid #dee2e6;
    `;

    this.spacer = document.createElement('div');
    this.spacer.className = 'virtual-scroller-spacer';
    this.spacer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    `;

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

    // Add scroll listener
    this._scrollHandler = debounce(() => this.onScroll(), 16); // ~1 frame at 60fps
    this.wrapper.addEventListener('scroll', this._scrollHandler, {
      passive: true,
    });

    // Add resize observer
    const debouncedResize = debounce(() => {
      this.containerHeight = this.wrapper.clientHeight;
      this.render();
    }, 100);
    this.resizeObserver = new ResizeObserver(debouncedResize);
    this.resizeObserver.observe(this.wrapper);

    this.containerHeight = this.wrapper.clientHeight;
  }

  setData(data) {
    this.data = data;
    this.scrollTop = 0;
    this.wrapper.scrollTop = 0;
    this.render();
  }

  setHeaders(headers) {
    this.headers = headers;
    this.render();
  }

  onScroll() {
    const newScrollTop = this.wrapper.scrollTop;
    if (Math.abs(newScrollTop - this.scrollTop) > this.rowHeight / 2) {
      this.scrollTop = newScrollTop;
      this.render();
    }
  }

  getVisibleRange() {
    const start = Math.floor(this.scrollTop / this.rowHeight);
    const end = Math.ceil(
      (this.scrollTop + this.containerHeight) / this.rowHeight
    );

    // Add buffer for smooth scrolling
    const bufferedStart = Math.max(0, start - this.bufferSize);
    const bufferedEnd = Math.min(this.data.length, end + this.bufferSize);

    return { start: bufferedStart, end: bufferedEnd };
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.content.innerHTML =
        '<div style="padding: 20px;">No data available</div>';
      return;
    }

    const { start, end } = this.getVisibleRange();
    this.visibleStart = start;
    this.visibleEnd = end;

    // Update spacer height to match total content height
    const totalHeight = this.data.length * this.rowHeight + HEADER_HEIGHT_PX; // +HEADER_HEIGHT_PX for header
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
    if (this.renderHeader && this.headers.length > 0) {
      const thead = this.renderHeader(this.headers);
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

      const row = this.renderRow
        ? this.renderRow(this.data[i], i, this.headers)
        : this.createDefaultRow(this.data[i], i);

      // Add drag-and-drop support with optimization
      if (this.onDragDrop) {
        row.setAttribute('draggable', 'true');
        row.style.cursor = 'move';
        row.dataset.virtualIndex = i;

        row.addEventListener('dragstart', e => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', i);
          row.style.opacity = '0.5';
        });

        row.addEventListener('dragend', () => {
          row.style.opacity = '1';
        });

        row.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', e => {
          e.preventDefault();
          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
          const toIndex = i;
          if (fromIndex !== toIndex && this.onDragDrop) {
            this.onDragDrop(fromIndex, toIndex);
          }
        });
      }

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    this.content.appendChild(table);
  }

  createDefaultRow(rowData, index) {
    const tr = document.createElement('tr');
    tr.style.height = `${this.rowHeight}px`;
    tr.dataset.rowIndex = index;

    this.headers.forEach(header => {
      const td = document.createElement('td');
      td.style.cssText = `
        padding: 8px;
        border-bottom: 1px solid #dee2e6;
        border-right: 1px solid #dee2e6;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      td.textContent = rowData[header] ?? '';
      tr.appendChild(td);
    });

    return tr;
  }

  mount(parentElement) {
    parentElement.innerHTML = '';
    parentElement.appendChild(this.wrapper);
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.wrapper) {
      if (this._scrollHandler) {
        this.wrapper.removeEventListener('scroll', this._scrollHandler);
        this._scrollHandler = null;
      }
      if (this.wrapper.parentElement) {
        this.wrapper.parentElement.removeChild(this.wrapper);
      }
    }
  }

  scrollToTop() {
    if (this.wrapper) {
      this.wrapper.scrollTop = 0;
      this.scrollTop = 0;
      this.render();
    }
  }

  refresh() {
    this.render();
  }
}
