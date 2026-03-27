/**
 * Performance Configuration and Thresholds
 * Centralized configuration for performance optimizations
 */
import {
  WORKERS_THRESHOLD as _WORKERS_THRESHOLD,
  WASM_THRESHOLD as _WASM_THRESHOLD,
  WASM_SAFETY_LIMIT as _WASM_SAFETY_LIMIT,
  CHUNK_SIZE_256KB,
  CHUNK_SIZE_1MB,
  CHUNK_SIZE_2MB,
  CHUNK_SIZE_5MB,
  CHUNK_MEDIUM_UPPER,
  CHUNK_LARGE_UPPER,
} from '../config/constants.js';
import type { PerformanceThresholds } from '../types/interfaces';

export type { PerformanceThresholds };

export class PerformanceConfig {
  private static config: PerformanceThresholds = {
    // Worker configuration - for files < 5MB
    useWorkersAboveSize: _WORKERS_THRESHOLD,
    useWorkersAboveRows: 5000, // 5k rows

    // WASM configuration - for files >= 5MB (up to 8MB safety limit)
    // Strategy: Workers for < 5MB, WASM for 5-8MB, Workers for > 8MB (streaming)
    useWasmAboveSize: _WASM_THRESHOLD,
    useWasmAboveRows: 20000, // 20k rows

    // UI interaction limits (with virtual scrolling support)
    maxRowsForDragDrop: 1000, // Traditional rendering limit (virtual scrolling handles larger datasets)
    maxRowsForFullRender: 10000, // Virtual scrolling threshold
    defaultPageSize: 50, // Show 50 rows per page
    maxPageSize: 500, // Max 500 rows per page

    // Sampling configuration
    sampleThreshold: 10000, // Sample if > 10k rows
    sampleSize: 5000, // Sample 5k rows

    // Virtual scrolling configuration
    enableVirtualScroll: true, // Enable virtual scrolling
    virtualScrollThreshold: 1000, // Auto-enable at 1k rows
    virtualScrollRowHeight: 40, // Default row height (px)
    virtualScrollBuffer: 10, // Extra rows for smooth scrolling
  };

  /**
   * Get current performance configuration
   */
  public static getConfig(): PerformanceThresholds {
    return { ...this.config };
  }

  /**
   * Update performance configuration
   */
  public static updateConfig(updates: Partial<PerformanceThresholds>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Check if workers should be used for given size/rows
   */
  public static shouldUseWorkers(fileSize: number, rowCount?: number): boolean {
    if (rowCount !== undefined) {
      return (
        fileSize >= this.config.useWorkersAboveSize ||
        rowCount >= this.config.useWorkersAboveRows
      );
    }
    return fileSize >= this.config.useWorkersAboveSize;
  }

  /**
   * Check if WASM should be used for given size/rows
   */
  public static shouldUseWasm(fileSize: number, rowCount?: number): boolean {
    if (rowCount !== undefined) {
      return (
        fileSize >= this.config.useWasmAboveSize ||
        rowCount >= this.config.useWasmAboveRows
      );
    }
    return fileSize >= this.config.useWasmAboveSize;
  }

  /**
   * Check if drag/drop should be enabled
   */
  public static isDragDropAllowed(rowCount: number): boolean {
    return rowCount <= this.config.maxRowsForDragDrop;
  }

  /**
   * Check if pagination is required
   */
  public static requiresPagination(rowCount: number): boolean {
    return rowCount > this.config.maxRowsForFullRender;
  }

  /**
   * Get appropriate page size for dataset
   */
  public static getPageSize(rowCount: number): number {
    if (rowCount <= 100) return 50;
    if (rowCount <= 1000) return 50;
    if (rowCount <= 10000) return 100;
    return 100; // For very large datasets
  }

  /**
   * Check if sampling should be used
   */
  public static shouldSample(rowCount: number): boolean {
    return rowCount > this.config.sampleThreshold;
  }

  /**
   * Get sample size for dataset
   */
  public static getSampleSize(rowCount: number): number {
    if (!this.shouldSample(rowCount)) return rowCount;
    return Math.min(this.config.sampleSize, rowCount);
  }

  /**
   * Get optimal chunk size for file
   */
  public static getChunkSize(fileSize: number): number {
    if (fileSize < CHUNK_SIZE_1MB) return CHUNK_SIZE_256KB;
    if (fileSize < CHUNK_MEDIUM_UPPER) return CHUNK_SIZE_1MB;
    if (fileSize < CHUNK_LARGE_UPPER) return CHUNK_SIZE_2MB;
    return CHUNK_SIZE_5MB;
  }

  /**
   * Get performance mode for dataset
   * Returns the optimal processing mode based on file size
   */
  public static getPerformanceMode(
    fileSize: number,
    rowCount: number
  ): 'standard' | 'workers' | 'wasm' | 'streaming-wasm' {
    // TIER 3: Files > 8MB → Streaming + WASM Hybrid
    if (fileSize > _WASM_SAFETY_LIMIT) {
      return 'streaming-wasm';
    }

    // TIER 2: Files 5-8MB → Pure WASM (in-memory, fastest)
    if (fileSize >= _WASM_THRESHOLD && fileSize <= _WASM_SAFETY_LIMIT) {
      return 'wasm';
    }

    // TIER 1: Files 1-5MB → Web Workers (parallel processing)
    if (this.shouldUseWorkers(fileSize, rowCount)) {
      return 'workers';
    }

    // TIER 0: Small files < 1MB → Standard JavaScript
    return 'standard';
  }

  /**
   * Check if virtual scrolling should be used
   * @param rowCount Number of rows in the dataset
   * @returns true if virtual scrolling should be enabled
   */
  public static shouldUseVirtualScroll(rowCount: number): boolean {
    return (
      this.config.enableVirtualScroll &&
      rowCount >= this.config.virtualScrollThreshold
    );
  }

  /**
   * Get virtual scroll configuration
   * @returns Virtual scroll settings
   */
  public static getVirtualScrollConfig(): {
    rowHeight: number;
    bufferSize: number;
    threshold: number;
  } {
    return {
      rowHeight: this.config.virtualScrollRowHeight,
      bufferSize: this.config.virtualScrollBuffer,
      threshold: this.config.virtualScrollThreshold,
    };
  }
}
