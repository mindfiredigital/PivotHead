/**
 * WebAssembly CSV Processor
 *
 * High-performance CSV processing using WebAssembly for large datasets
 */

import { getWasmLoader, WasmLoader } from './WasmLoader';
import { logger } from '../logger/logger.js';
import { WASM_SAFETY_LIMIT } from '../config/constants.js';
import type {
  WasmProcessOptions,
  WasmProcessResult,
  DataRecord,
} from '../types/interfaces';

export type { WasmProcessOptions, WasmProcessResult };

export class WasmCSVProcessor {
  private wasmLoader: WasmLoader;
  private isInitialized = false;

  constructor() {
    this.wasmLoader = getWasmLoader();
  }

  /**
   * Initialize WASM module
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      if (!WasmLoader.isSupported()) {
        logger.warn(
          '⚠️ WebAssembly not supported, falling back to Web Workers'
        );
        return false;
      }

      await this.wasmLoader.load();
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.warn('⚠️ Failed to initialize WASM:', error);
      return false;
    }
  }

  /**
   * Check if WASM is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.wasmLoader.isModuleLoaded();
  }

  /**
   * Process CSV data using WASM
   */
  public async processCSV(
    csvData: string,
    options: WasmProcessOptions = {}
  ): Promise<WasmProcessResult> {
    const startTime = performance.now();

    try {
      if (!this.isReady()) {
        throw new Error('WASM module not initialized');
      }

      const {
        delimiter = ',',
        hasHeader = true,
        trimValues = true,
        skipEmptyLines = true,
      } = options;

      logger.info('🚀 Processing CSV with WebAssembly...');

      // Parse CSV structure using WASM
      const parseResult = this.wasmLoader.parseCSVChunk(csvData, {
        delimiter,
        hasHeader,
        trimValues,
      });

      if (parseResult.errorCode !== 0) {
        throw new Error(parseResult.errorMessage || 'WASM parsing failed');
      }

      logger.info(
        `📊 WASM parsed: ${parseResult.rowCount} rows, ${parseResult.colCount} columns`
      );

      // Now parse the actual data (JavaScript fallback for now)
      // In a full implementation, this would also be done in WASM
      const rows = this.parseCSVRows(csvData, {
        delimiter,
        hasHeader,
        trimValues,
        skipEmptyLines,
      });

      // Use providedHeaders (for non-first streaming chunks) or detect from first row
      let headers: string[] | undefined;
      let dataRows: string[][];
      if (options.providedHeaders && options.providedHeaders.length > 0) {
        // Headers supplied externally — all rows in this chunk are data
        headers = options.providedHeaders;
        dataRows = rows;
      } else if (hasHeader && rows.length > 0) {
        headers = rows[0];
        dataRows = rows.slice(1);
      } else {
        headers = undefined;
        dataRows = rows;
      }

      // Convert rows to objects
      const data = this.rowsToObjects(dataRows, headers);

      const parseTime = performance.now() - startTime;

      logger.info(`✅ WASM processing completed in ${parseTime.toFixed(2)}ms`);

      return {
        success: true,
        data,
        headers,
        rowCount: dataRows.length,
        colCount: parseResult.colCount,
        parseTime,
      };
    } catch (error) {
      const parseTime = performance.now() - startTime;
      logger.error('❌ WASM processing error:', error);

      return {
        success: false,
        data: [],
        rowCount: 0,
        colCount: 0,
        parseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse CSV into rows (JavaScript implementation)
   * TODO: Move this logic to WASM for better performance
   */
  private parseCSVRows(csv: string, options: WasmProcessOptions): string[][] {
    const {
      delimiter = ',',
      trimValues = true,
      skipEmptyLines = true,
    } = options;

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const nextChar = i + 1 < csv.length ? csv[i + 1] : '';

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i++; // Skip next quote
          } else {
            // End of quoted field
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          // Start of quoted field
          inQuotes = true;
        } else if (char === delimiter) {
          // Field delimiter
          currentRow.push(trimValues ? currentField.trim() : currentField);
          currentField = '';
        } else if (char === '\n' || char === '\r') {
          // Row delimiter
          if (char === '\r' && nextChar === '\n') {
            i++; // Skip \n in \r\n
          }

          // Add last field
          currentRow.push(trimValues ? currentField.trim() : currentField);
          currentField = '';

          // Add row if not empty
          if (!skipEmptyLines || currentRow.some(f => f !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
        } else {
          currentField += char;
        }
      }
    }

    // Add last field and row if any
    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(trimValues ? currentField.trim() : currentField);
      if (!skipEmptyLines || currentRow.some(f => f !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  /**
   * Convert rows to objects
   */
  private rowsToObjects(rows: string[][], headers?: string[]): DataRecord[] {
    if (!headers || headers.length === 0) {
      // No headers, return as arrays
      return rows.map(row => ({ ...row }));
    }

    return rows.map(row => {
      const obj: DataRecord = {};
      headers.forEach((header, index) => {
        const value = row[index] ?? '';

        // Try to infer type using WASM
        if (this.isReady() && value !== '') {
          const fieldType = this.wasmLoader.detectFieldType(value);

          switch (fieldType) {
            case 1: // number
              obj[header] = this.wasmLoader.parseNumber(value);
              break;
            case 2: // boolean
              obj[header] = value.toLowerCase() === 'true';
              break;
            case 3: // null
              obj[header] = null;
              break;
            default: // string
              obj[header] = value;
          }
        } else {
          obj[header] = value;
        }
      });
      return obj;
    });
  }

  /**
   * Process CSV file using WASM
   */
  public async processFile(
    file: File,
    options: WasmProcessOptions = {}
  ): Promise<WasmProcessResult> {
    try {
      // Safety check: Don't process files that are too large for in-memory processing
      if (file.size > WASM_SAFETY_LIMIT) {
        logger.warn(
          `⚠️ File too large for WASM (${(file.size / 1024 / 1024).toFixed(2)}MB > 8MB). Should use Web Workers instead.`
        );
        return {
          success: false,
          data: [],
          rowCount: 0,
          colCount: 0,
          parseTime: 0,
          error: `File too large for WASM processing (${(file.size / 1024 / 1024).toFixed(2)}MB). Falling back to Web Workers.`,
        };
      }

      const text = await file.text();
      return this.processCSV(text, options);
    } catch (error) {
      return {
        success: false,
        data: [],
        rowCount: 0,
        colCount: 0,
        parseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Estimate memory usage for a dataset
   */
  public estimateMemory(rowCount: number, colCount: number): number {
    if (this.isReady()) {
      return this.wasmLoader.estimateMemory(rowCount, colCount);
    }
    // Fallback estimation
    return rowCount * colCount * 64;
  }

  /**
   * Get WASM version
   */
  public getVersion(): string {
    if (this.isReady()) {
      return this.wasmLoader.getVersion();
    }
    return 'N/A';
  }

  /**
   * Cleanup and release resources
   */
  public cleanup(): void {
    if (this.wasmLoader) {
      this.wasmLoader.unload();
    }
    this.isInitialized = false;
  }
}

/**
 * Singleton instance
 */
let wasmProcessorInstance: WasmCSVProcessor | null = null;

export const getWasmCSVProcessor = (): WasmCSVProcessor => {
  if (!wasmProcessorInstance) {
    wasmProcessorInstance = new WasmCSVProcessor();
  }
  return wasmProcessorInstance;
};
