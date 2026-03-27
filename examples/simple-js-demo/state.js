'use strict';
/**
 * Application state — single source of truth for simple-js-demo.
 *
 * All modules read engine references and UI state from here.
 * Only index.js writes to this object (during DOMContentLoaded init).
 * No other demo module should be imported here — this is the leaf node
 * of the dependency graph.
 */

export const appState = {
  // ── Engine references (written by index.js at init time) ──────────────────
  /** @type {import('@mindfiredigital/pivothead').PivotEngine|null} */
  pivotEngine: null,
  /** @type {any|null} ChartEngine instance */
  chartEngine: null,
  /** @type {any|null} ChartService instance */
  chartService: null,
  /** @type {any|null} ColorManager instance */
  colorManager: null,

  // ── UI state ──────────────────────────────────────────────────────────────
  /** Source data currently loaded into the table */
  currentData: [],
  /** 'processed' | 'raw' */
  currentViewMode: 'processed',
  /** Active color palette name */
  currentPalette: 'tableau10',
  /** Active chart type */
  currentChartType: 'column',
  /** Whether the analytics tab has been initialised */
  analyticsTabInitialized: false,

  // ── Pagination ────────────────────────────────────────────────────────────
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  },

  // ── Raw-data sort state (replaces window.rawDataSort) ─────────────────────
  rawDataSort: { column: null, direction: null },

  // ── Raw-data column order (replaces window.rawDataColumnOrder) ────────────
  /** @type {string[]|null} */
  rawDataColumnOrder: null,

  // ── File processing mode (replaces window.lastPerformanceMode) ───────────
  /** @type {string|null} e.g. 'wasm' | 'workers' | 'standard' */
  lastPerformanceMode: null,

  // ── VirtualScroller instance (managed by renderRaw.js) ───────────────────
  /** @type {any|null} */
  virtualScroller: null,

  // ── Cross-module callbacks registered by index.js ─────────────────────────
  /**
   * Trigger a full pivot re-configuration with a new config object.
   * Registered by index.js as `(newConfig) => void`.
   * @type {((newConfig: object) => void)|null}
   */
  onFormatTable: null,

  /**
   * Called when the fields popup drops fields into a new section.
   * Registered by index.js as `(droppedFields: object) => void`.
   * @type {((droppedFields: object) => void)|null}
   */
  onSectionItemDrop: null,

  /**
   * Trigger a file/data source connection flow.
   * Registered by index.js as `(fileType: string) => Promise<void>`.
   * @type {((fileType: string) => Promise<void>)|null}
   */
  onHandleFileConnection: null,

  /**
   * Trigger a full table re-render.
   * Registered by index.js as `() => void`.
   * @type {(() => void)|null}
   */
  onRenderTable: null,

  /**
   * Initialize (or re-initialize) the analytics tab chart.
   * Registered by index.js as `() => void`.
   * @type {(() => void)|null}
   */
  onInitializeAnalyticsTab: null,
};
