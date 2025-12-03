/**
 * Performance Configuration and Thresholds
 * Centralized configuration for performance optimizations
 */

export interface PerformanceThresholds {
  // Worker thresholds
  useWorkersAboveSize: number; // File size in bytes
  useWorkersAboveRows: number; // Row count

  // WASM thresholds (future use)
  useWasmAboveSize: number; // File size in bytes
  useWasmAboveRows: number; // Row count

  // UI interaction thresholds
  maxRowsForDragDrop: number; // Max rows to allow drag/drop
  maxRowsForFullRender: number; // Max rows to render at once
  defaultPageSize: number; // Default pagination page size
  maxPageSize: number; // Maximum page size

  // Sampling thresholds
  sampleThreshold: number; // When to start sampling
  sampleSize: number; // How many rows to sample
}

export class PerformanceConfig {
  private static config: PerformanceThresholds = {
    // Worker configuration (SDS aligned)
    useWorkersAboveSize: 5 * 1024 * 1024, // 5MB
    useWorkersAboveRows: 10000, // 10k rows

    // WASM configuration (SDS aligned)
    useWasmAboveSize: 10 * 1024 * 1024, // 10MB
    useWasmAboveRows: 50000, // 50k rows

    // UI interaction limits
    maxRowsForDragDrop: 1000, // Disable drag/drop above 1k rows
    maxRowsForFullRender: 10000, // Paginate above 10k rows
    defaultPageSize: 50, // Show 50 rows per page
    maxPageSize: 500, // Max 500 rows per page

    // Sampling configuration
    sampleThreshold: 10000, // Sample if > 10k rows
    sampleSize: 5000, // Sample 5k rows
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
    if (fileSize < 1024 * 1024) return 256 * 1024; // 256KB
    if (fileSize < 10 * 1024 * 1024) return 1024 * 1024; // 1MB
    if (fileSize < 100 * 1024 * 1024) return 2 * 1024 * 1024; // 2MB
    return 5 * 1024 * 1024; // 5MB
  }

  /**
   * Get performance mode for dataset
   */
  public static getPerformanceMode(
    fileSize: number,
    rowCount: number
  ): 'standard' | 'workers' | 'wasm' {
    if (this.shouldUseWasm(fileSize, rowCount)) return 'wasm';
    if (this.shouldUseWorkers(fileSize, rowCount)) return 'workers';
    return 'standard';
  }
}
