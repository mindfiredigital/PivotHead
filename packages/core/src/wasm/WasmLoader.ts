/**
 * WebAssembly Loader for High-Performance CSV Parsing
 *
 * This module handles loading and interacting with the WASM CSV parser
 * for near-native performance with large datasets.
 */

import { fetchWasmBinary, getWasmUrl } from './wasmAssets';
import { logger } from '../logger/logger.js';
import type {
  WasmCSVResult,
  WasmModule,
  WasmInstance,
  WasmInstantiateFunction,
} from '../types/interfaces';

export type { WasmCSVResult, WasmModule };

// Dynamic import to make it optional
let instantiate: WasmInstantiateFunction | null = null;

// Try to load the loader asynchronously
async function loadAssemblyScriptLoader() {
  if (instantiate) return instantiate;

  try {
    // Try dynamic import (works in both dev and production)
    const module = await import('@assemblyscript/loader');
    instantiate = module.instantiate as WasmInstantiateFunction;
    return instantiate;
  } catch (error) {
    logger.warn('AssemblyScript loader not available:', error);
    return null;
  }
}

export class WasmLoader {
  private static instance: WasmLoader | null = null;
  private wasmModule: WasmInstance | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WasmLoader {
    if (!WasmLoader.instance) {
      WasmLoader.instance = new WasmLoader();
    }
    return WasmLoader.instance;
  }

  /**
   * Check if WebAssembly is supported
   */
  public static isSupported(): boolean {
    try {
      return (
        typeof WebAssembly !== 'undefined' &&
        typeof WebAssembly.instantiate === 'function'
      );
    } catch {
      return false;
    }
  }

  /**
   * Load the WASM module
   */
  public async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadModule();
    return this.loadPromise;
  }

  /**
   * Internal method to load WASM module
   */
  private async _loadModule(): Promise<void> {
    try {
      // Try to load the AssemblyScript loader
      const loader = await loadAssemblyScriptLoader();
      if (!loader) {
        throw new Error(
          '@assemblyscript/loader not available. Install with: pnpm add @assemblyscript/loader'
        );
      }

      if (!WasmLoader.isSupported()) {
        throw new Error('WebAssembly is not supported in this browser');
      }

      logger.info('🚀 Loading WebAssembly CSV parser...');

      // Get WASM URL from the bundler-friendly helper
      // This automatically works with Vite, Webpack, Rollup, etc.
      const wasmUrl = getWasmUrl();
      logger.info(`Loading WASM from: ${wasmUrl}`);

      // Fetch the WASM binary using the helper
      let wasmBinary: ArrayBuffer;
      try {
        wasmBinary = await fetchWasmBinary();
        logger.info(
          `✅ WASM file loaded successfully (${wasmBinary.byteLength} bytes)`
        );
      } catch (fetchError) {
        logger.error(
          `❌ Failed to fetch WASM file from ${wasmUrl}:`,
          fetchError
        );
        throw new Error(
          `WASM file not found at ${wasmUrl}. Make sure to run 'npm run build:wasm' in the core package.`
        );
      }

      // Instantiate the WASM module
      this.wasmModule = await loader(wasmBinary, {
        env: {
          abort: (msg: number, file: number, line: number, column: number) => {
            logger.error(`WASM abort: ${msg} at ${file}:${line}:${column}`);
          },
        },
      });

      this.isLoaded = true;

      const version = this.wasmModule.exports.getVersion();
      logger.info(
        `✅ WebAssembly CSV parser loaded successfully (v${version})`
      );
    } catch (error) {
      this.isLoaded = false;
      this.loadPromise = null;
      logger.error('❌ Failed to load WASM module:', error);
      throw error;
    }
  }

  /**
   * Check if WASM module is loaded
   */
  public isModuleLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Parse CSV chunk using WASM
   */
  public parseCSVChunk(
    input: string,
    options: {
      delimiter?: string;
      hasHeader?: boolean;
      trimValues?: boolean;
    } = {}
  ): WasmCSVResult {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    const delimiter = options.delimiter?.charCodeAt(0) ?? 44; // Default: comma
    const hasHeader = options.hasHeader ?? true;
    const trimValues = options.trimValues ?? true;

    try {
      // Call WASM function (returns error code)
      const errorCode = this.wasmModule.exports.parseCSVChunk(
        this.wasmModule.exports.__newString(input),
        delimiter,
        hasHeader ? 1 : 0,
        trimValues ? 1 : 0
      );

      // Get results from individual getter functions
      const rowCount = this.wasmModule.exports.getLastRowCount();
      const colCount = this.wasmModule.exports.getLastColCount();
      const errorMessagePtr = this.wasmModule.exports.getLastErrorMessage();
      const errorMessage = this.wasmModule.exports.__getString(errorMessagePtr);

      return {
        rowCount,
        colCount,
        errorCode,
        errorMessage,
      };
    } catch (error) {
      logger.error('Error in WASM parseCSVChunk:', error);
      throw error;
    }
  }

  /**
   * Extract field from CSV data using WASM
   */
  public extractField(
    input: string,
    start: number,
    end: number,
    trimValues = true
  ): string {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    const resultPtr = this.wasmModule.exports.extractField(
      this.wasmModule.exports.__newString(input),
      start,
      end,
      trimValues ? 1 : 0
    );

    return this.wasmModule.exports.__getString(resultPtr);
  }

  /**
   * Parse number using WASM
   */
  public parseNumber(input: string): number {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    return this.wasmModule.exports.parseNumber(
      this.wasmModule.exports.__newString(input)
    );
  }

  /**
   * Detect field type using WASM
   * Returns: 0=string, 1=number, 2=boolean, 3=null
   */
  public detectFieldType(value: string): number {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    return this.wasmModule.exports.detectFieldType(
      this.wasmModule.exports.__newString(value)
    );
  }

  /**
   * Estimate memory usage for parsed data
   */
  public estimateMemory(rowCount: number, colCount: number): number {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    return this.wasmModule.exports.estimateMemory(rowCount, colCount);
  }

  /**
   * Get WASM module version
   */
  public getVersion(): string {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    const versionPtr = this.wasmModule.exports.getVersion();
    return this.wasmModule.exports.__getString(versionPtr);
  }

  /**
   * Run benchmark
   */
  public benchmark(input: string): number {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    return this.wasmModule.exports.benchmark(
      this.wasmModule.exports.__newString(input)
    );
  }

  /**
   * Unload WASM module and free resources
   */
  public unload(): void {
    if (this.wasmModule && this.wasmModule.exports.__release) {
      this.wasmModule.exports.__release();
    }
    this.wasmModule = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

/**
 * Singleton instance getter
 */
export const getWasmLoader = (): WasmLoader => {
  return WasmLoader.getInstance();
};
