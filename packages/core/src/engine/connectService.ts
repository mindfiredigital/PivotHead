import { PivotEngine } from './pivotEngine';
import type {
  FileConnectionResult,
  CSVParseOptions,
  JSONParseOptions,
  ConnectionOptions,
  DataRecord,
} from '../types/interfaces';
import { WorkerPool } from '../workers/WorkerPool';
import { StreamingFileReader } from '../workers/StreamingFileReader';
import { getWasmCSVProcessor } from '../wasm/WasmCSVProcessor';
import { WasmLoader } from '../wasm/WasmLoader';
import { logger } from '../logger/logger.js';
import {
  WORKERS_THRESHOLD,
  WASM_THRESHOLD,
  WASM_SAFETY_LIMIT,
} from '../config/constants.js';

// Extracted modules
import { parseCSV, processCSVData } from './connect/csvParser';
import {
  openFilePicker,
  validateFile,
  readFileAsText,
  getFileExtension,
  formatFileSize,
  extractArrayFromPath,
  SUPPORTED_CSV_EXTENSIONS,
  SUPPORTED_JSON_EXTENSIONS,
} from './connect/fileUtils';
import {
  applyParsedDataToEngine,
  DEFAULT_MAX_RECORDS,
  LARGE_FILE_MAX_RECORDS,
} from './connect/engineUpdater';
import { getWorkerCode } from './connect/workerCode';
import { LARGE_FILE_THRESHOLD } from '../config/constants.js';

export type {
  FileConnectionResult,
  CSVParseOptions,
  JSONParseOptions,
  ConnectionOptions,
};

/**
 * Service class for handling local file connections
 */
export class ConnectService {
  // Worker pool instance (reused across imports)
  private static workerPool: WorkerPool | null = null;

  /**
   * Opens a file picker for CSV files and imports data into the pivot engine
   */
  public static async connectToLocalCSV(
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const file = await openFilePicker(SUPPORTED_CSV_EXTENSIONS);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      return await this.processCSVFile(file, engine, options);
    } catch (error) {
      logger.error('Error connecting to CSV file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Opens a file picker for JSON files and imports data into the pivot engine
   */
  public static async connectToLocalJSON(
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const file = await openFilePicker(SUPPORTED_JSON_EXTENSIONS);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      return await this.processJSONFile(file, engine, options);
    } catch (error) {
      logger.error('Error connecting to JSON file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generic method to connect to any supported file type
   */
  public static async connectToLocalFile(
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const allExtensions = [
        ...SUPPORTED_CSV_EXTENSIONS,
        ...SUPPORTED_JSON_EXTENSIONS,
      ];

      const file = await openFilePicker(allExtensions);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      const fileExtension = getFileExtension(file.name);

      if (SUPPORTED_CSV_EXTENSIONS.includes(fileExtension)) {
        return await this.processCSVFile(file, engine, options);
      } else if (SUPPORTED_JSON_EXTENSIONS.includes(fileExtension)) {
        return await this.processJSONFile(file, engine, options);
      } else {
        return {
          success: false,
          error: `Unsupported file type: ${fileExtension}`,
        };
      }
    } catch (error) {
      logger.error('Error connecting to local file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Processes a CSV file and updates the pivot engine
   * Routes to the appropriate tier based on file size.
   */
  private static async processCSVFile(
    file: File,
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    const validationResult = validateFile(file, options);
    if (!validationResult.success) {
      return validationResult;
    }

    // 🚀 TIER 3: Files > 8MB → Streaming + WASM Hybrid (chunks)
    if (file.size > WASM_SAFETY_LIMIT && WasmLoader.isSupported()) {
      logger.info(
        `🚀 Large file detected (${formatFileSize(file.size)}). Using Streaming + WASM hybrid mode...`
      );
      try {
        const result = await this.processCSVFileWithStreamingWasm(
          file,
          engine,
          options
        );
        if (result.success) return result;
        logger.warn('⚠️ Streaming + WASM failed, falling back to Workers');
      } catch (error) {
        logger.warn('⚠️ Streaming + WASM error:', error);
        logger.warn('Falling back to Web Workers');
      }
    }

    // 🔥 TIER 2: Files 5-8MB → Pure WASM (in-memory, fastest)
    if (
      file.size >= WASM_THRESHOLD &&
      file.size <= WASM_SAFETY_LIMIT &&
      WasmLoader.isSupported()
    ) {
      logger.info(
        `🚀 Medium-large file detected (${formatFileSize(file.size)}). Using WASM for maximum speed...`
      );
      try {
        const wasmResult = await this.processCSVFileWithWasm(
          file,
          engine,
          options
        );
        if (wasmResult.success) return wasmResult;
        logger.warn('⚠️ WASM processing failed, falling back to Workers');
      } catch (error) {
        logger.warn('⚠️ WASM processing error:', error);
        logger.warn('Falling back to Web Workers');
      }
    }

    // ⚡ TIER 1: Files 1-5MB → Web Workers (parallel processing)
    if (file.size >= WORKERS_THRESHOLD && options.useWorkers !== false) {
      logger.info(
        `Medium file detected (${formatFileSize(file.size)}). Using Web Workers for parallel processing.`
      );
      return this.processCSVFileWithWorkers(file, engine, options);
    }

    // Default: small file, parse in main thread
    try {
      const csvOptions = {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
        ...options.csv,
      };

      const text = await readFileAsText(file, options.onProgress);
      const parsedData = parseCSV(text, csvOptions);
      const processedData = processCSVData(parsedData);

      return applyParsedDataToEngine({
        file,
        parsedData: processedData,
        engine,
        options,
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Processes a CSV file using WebAssembly for maximum performance
   */
  private static async processCSVFileWithWasm(
    file: File,
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    try {
      const csvOptions = {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
        ...options.csv,
      };

      const wasmProcessor = getWasmCSVProcessor();
      const initialized = await wasmProcessor.initialize();

      if (!initialized) {
        logger.warn(
          '⚠️ WASM initialization failed, falling back to Web Workers'
        );
        return { success: false, error: 'WASM initialization failed' };
      }

      const wasmResult = await wasmProcessor.processFile(file, {
        delimiter: csvOptions.delimiter,
        hasHeader: csvOptions.hasHeader,
        trimValues: csvOptions.trimValues,
      });

      if (!wasmResult.success) {
        return { success: false, error: 'WASM processing failed' };
      }

      return applyParsedDataToEngine({
        file,
        parsedData: wasmResult.data,
        engine,
        options,
        performanceModeOverride: 'wasm',
      });
    } catch (error) {
      logger.error('WASM processing error:', error);
      return {
        success: false,
        error: `WASM processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Processes large CSV files using Streaming + WASM chunks
   * Optimized for files > 8MB
   */
  private static async processCSVFileWithStreamingWasm(
    file: File,
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    try {
      logger.info('🚀 Using Streaming + WASM hybrid mode for large file...');

      const csvOptions = {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
        ...options.csv,
      };

      const wasmProcessor = getWasmCSVProcessor();
      const initialized = await wasmProcessor.initialize();

      if (!initialized) {
        logger.warn(
          '⚠️ WASM initialization failed, falling back to Web Workers'
        );
        return { success: false, error: 'WASM initialization failed' };
      }

      // Calculate record limit upfront so we can stop streaming early
      const isLargeFile = file.size > LARGE_FILE_THRESHOLD;
      const maxRecords =
        options.maxRecords ??
        (isLargeFile ? LARGE_FILE_MAX_RECORDS : DEFAULT_MAX_RECORDS);

      const allData: DataRecord[] = [];
      let headers: string[] | undefined;
      let leftover = '';
      let chunkCount = 0;
      let totalRowsParsed = 0;

      // Use optimal chunk size based on file size instead of fixed 4MB
      const CHUNK_SIZE = StreamingFileReader.getOptimalChunkSize(file.size);

      logger.info(
        `Processing with WASM, chunk size: ${formatFileSize(CHUNK_SIZE)}, max records: ${maxRecords.toLocaleString()}`
      );

      const startTime = performance.now();

      // AbortController to stop reading once we have enough rows
      const abortController = new AbortController();

      await StreamingFileReader.readFileInChunks(file, {
        chunkSizeBytes: CHUNK_SIZE,
        encoding: csvOptions.encoding,
        signal: abortController.signal,
        onProgress: progress => {
          if (options.onProgress) options.onProgress(progress);
        },
        onChunk: async chunk => {
          // Stop processing if we already have enough rows
          if (allData.length >= maxRecords) {
            abortController.abort();
            return;
          }

          chunkCount++;
          const fullText = leftover + chunk.text;
          leftover = '';

          const wasmResult = await wasmProcessor.processCSV(fullText, {
            delimiter: csvOptions.delimiter,
            hasHeader: chunk.isFirstChunk && csvOptions.hasHeader,
            trimValues: csvOptions.trimValues,
            // For non-first chunks pass the already-detected headers so
            // rowsToObjects can map column values correctly (not numeric indices)
            providedHeaders:
              !chunk.isFirstChunk && headers ? headers : undefined,
          });

          if (!wasmResult.success || !wasmResult.data) {
            logger.warn(
              `⚠️ WASM failed on chunk ${chunk.chunkId}, chunk skipped`
            );
            return;
          }

          if (chunk.isFirstChunk && wasmResult.data.length > 0) {
            headers = Object.keys(wasmResult.data[0]);
            logger.info(`📋 Headers detected: ${headers.join(', ')}`);
          }

          // Handle incomplete last line (carry over to next chunk)
          if (!chunk.isLastChunk) {
            const lastNewline = fullText.lastIndexOf('\n');
            if (lastNewline !== -1) {
              leftover = fullText.substring(lastNewline + 1);
              if (wasmResult.data.length > 0) {
                wasmResult.data.pop();
              }
            }
          }

          totalRowsParsed += wasmResult.data.length;

          // Only take rows up to the limit — avoid accumulating beyond maxRecords
          const remaining = maxRecords - allData.length;
          const rowsToAdd =
            wasmResult.data.length <= remaining
              ? wasmResult.data
              : wasmResult.data.slice(0, remaining);

          // Use loop instead of spread to avoid call stack overflow with large arrays
          for (let i = 0; i < rowsToAdd.length; i++) {
            allData.push(rowsToAdd[i]);
          }

          logger.info(
            `Chunk ${chunk.chunkId} processed: ${wasmResult.data.length} rows (collected: ${allData.length}/${maxRecords})`
          );

          // Release chunk data reference for GC
          wasmResult.data = [];

          // Abort streaming if we've collected enough
          if (allData.length >= maxRecords) {
            logger.info(
              `✅ Reached record limit (${maxRecords.toLocaleString()}), stopping file read early.`
            );
            abortController.abort();
          }
        },
      });

      const parseTime = performance.now() - startTime;
      logger.info(
        `✅ Streaming + WASM completed in ${(parseTime / 1000).toFixed(2)}s`
      );
      logger.info(
        `Processed ${chunkCount} chunks, ${totalRowsParsed} rows parsed, ${allData.length} rows collected.`
      );

      if (options.onProgress) options.onProgress(90);

      return applyParsedDataToEngine({
        file,
        parsedData: allData,
        engine,
        options,
        performanceModeOverride: 'streaming-wasm',
        parseTime,
      });
    } catch (error) {
      logger.error('Error in Streaming + WASM processing:', error);
      return {
        success: false,
        error: `Streaming + WASM failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Processes a CSV file using Web Workers and streaming
   */
  private static async processCSVFileWithWorkers(
    file: File,
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    try {
      const csvOptions = {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
        ...options.csv,
      };

      // Initialize worker pool if needed
      if (!this.workerPool) {
        const workerCode = getWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);

        this.workerPool = new WorkerPool(
          workerUrl,
          options.workerCount || Math.max(1, navigator.hardwareConcurrency - 1)
        );
      }

      // Calculate record limit upfront to stop early
      const isLargeFile = file.size > LARGE_FILE_THRESHOLD;
      const maxRecords =
        options.maxRecords ??
        (isLargeFile ? LARGE_FILE_MAX_RECORDS : DEFAULT_MAX_RECORDS);

      const allData: DataRecord[] = [];
      let headers: string[] | undefined;
      let leftover: string | undefined;
      let chunkCount = 0;

      const chunkSize =
        options.chunkSizeBytes ||
        StreamingFileReader.getOptimalChunkSize(file.size);

      logger.info(
        `Processing with ${this.workerPool.getWorkerCount()} workers, chunk size: ${formatFileSize(chunkSize)}, max records: ${maxRecords.toLocaleString()}`
      );

      const startTime = performance.now();
      const abortController = new AbortController();

      await StreamingFileReader.readFileInChunks(file, {
        chunkSizeBytes: chunkSize,
        encoding: csvOptions.encoding,
        signal: abortController.signal,
        onProgress: progress => {
          if (options.onProgress) options.onProgress(progress);
        },
        onChunk: async chunk => {
          if (allData.length >= maxRecords) {
            abortController.abort();
            return;
          }

          chunkCount++;

          const result = await this.workerPool!.execute({
            type: 'PARSE_CHUNK',
            chunkId: chunk.chunkId,
            text: chunk.text,
            isFirstChunk: chunk.isFirstChunk,
            isLastChunk: chunk.isLastChunk,
            delimiter: csvOptions.delimiter,
            headers,
            leftover,
          });

          if (result.headers) headers = result.headers;
          leftover = result.leftover;

          if (result.data && result.data.length > 0) {
            const remaining = maxRecords - allData.length;
            const limit = Math.min(result.data.length, remaining);
            for (let i = 0; i < limit; i++) {
              allData.push(result.data[i]);
            }
          }

          logger.info(
            `Chunk ${chunk.chunkId} processed: ${result.rowCount} rows (collected: ${allData.length}/${maxRecords})`
          );

          if (allData.length >= maxRecords) {
            logger.info(`✅ Reached record limit, stopping file read early.`);
            abortController.abort();
          }
        },
      });

      const parseTime = performance.now() - startTime;
      logger.info(`Parsing completed in ${(parseTime / 1000).toFixed(2)}s`);
      logger.info(
        `Streaming complete. Processed ${chunkCount} chunks, ${allData.length} rows collected.`
      );

      if (options.onProgress) options.onProgress(90);

      return applyParsedDataToEngine({
        file,
        parsedData: allData,
        engine,
        options,
        parseTime,
      });
    } catch (error) {
      logger.error('Error in worker-based CSV processing:', error);
      return {
        success: false,
        error: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Processes a JSON file and updates the pivot engine
   */
  private static async processJSONFile(
    file: File,
    engine: PivotEngine<DataRecord>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    const validationResult = validateFile(file, options);
    if (!validationResult.success) {
      return validationResult;
    }

    try {
      const text = await readFileAsText(file, options.onProgress);
      const jsonData = JSON.parse(text);

      // Extract array data based on arrayPath option
      let arrayData: DataRecord[] = [];

      if (options.json?.arrayPath) {
        arrayData = extractArrayFromPath(jsonData, options.json.arrayPath);
      } else if (Array.isArray(jsonData)) {
        arrayData = jsonData;
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        arrayData = jsonData.data;
      } else if (jsonData.records && Array.isArray(jsonData.records)) {
        arrayData = jsonData.records;
      } else {
        // Try to find the first array property
        for (const key in jsonData) {
          if (Array.isArray(jsonData[key])) {
            arrayData = jsonData[key];
            break;
          }
        }
      }

      if (arrayData.length === 0) {
        return {
          success: false,
          error:
            'No array data found in JSON file. Please ensure the file contains an array of objects.',
        };
      }

      return applyParsedDataToEngine({
        file,
        parsedData: arrayData,
        engine,
        options,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: 'Invalid JSON format. Please check your file syntax.',
        };
      }

      return {
        success: false,
        error: `Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Creates a summary of the import result
   */
  public static createImportSummary(result: FileConnectionResult): string {
    if (!result.success) {
      return `Import failed: ${result.error}`;
    }

    let summary = `Successfully imported ${result.recordCount} records from ${result.fileName}`;

    if (result.columns) {
      summary += `\nColumns: ${result.columns.join(', ')}`;
    }

    if (result.fileSize) {
      summary += `\nFile size: ${formatFileSize(result.fileSize)}`;
    }

    if (result.validationErrors && result.validationErrors.length > 0) {
      summary += `\n\nWarnings:\n${result.validationErrors.map(w => `• ${w}`).join('\n')}`;
    }

    return summary;
  }

  /**
   * Shows a browser notification for import results
   */
  public static showImportNotification(result: FileConnectionResult): void {
    const message = this.createImportSummary(result);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('PivotHead Import', { body: message });
        return;
      }
      if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('PivotHead Import', { body: message });
          } else {
            logger.info(message);
          }
        });
        return;
      }
    }

    logger.info(message);
  }
}
