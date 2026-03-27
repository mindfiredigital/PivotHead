import type {
  FileConnectionResult,
  ConnectionOptions,
  DataRecord,
} from '../../types/interfaces';
import { PivotEngine } from '../pivotEngine';
import { PerformanceConfig } from '../PerformanceConfig';
import { logger } from '../../logger/logger.js';
import { LARGE_FILE_THRESHOLD } from '../../config/constants.js';
import { buildAutoLayout } from './autoLayout';
import { validateDataStructure } from './fileUtils';

const DEFAULT_MAX_RECORDS = 50000;
const LARGE_FILE_MAX_RECORDS = 20000;

export { DEFAULT_MAX_RECORDS, LARGE_FILE_MAX_RECORDS };

export interface PostParseOptions {
  file: File;
  parsedData: DataRecord[];
  engine: PivotEngine<DataRecord>;
  options: ConnectionOptions;
  /** If true, skip processCSVData normalization (already done by caller) */
  skipNormalization?: boolean;
  /** Override performance mode label */
  performanceModeOverride?: 'standard' | 'workers' | 'wasm' | 'streaming-wasm';
  /** Parse timing in ms (for streaming modes) */
  parseTime?: number;
}

/**
 * Shared post-parse logic: record limiting, validation, layout building,
 * engine updating, conditional formatting, and performance config.
 *
 * This deduplicates the code that was repeated across processCSVFile,
 * processCSVFileWithWasm, processCSVFileWithStreamingWasm, and processCSVFileWithWorkers.
 */
export function applyParsedDataToEngine(
  opts: PostParseOptions
): FileConnectionResult {
  const { file, engine, options, performanceModeOverride, parseTime } = opts;
  let processedData = opts.parsedData;

  // Apply record limit based on file size for better UX
  const isLargeFile = file.size > LARGE_FILE_THRESHOLD;
  const maxRecords =
    options.maxRecords ??
    (isLargeFile ? LARGE_FILE_MAX_RECORDS : DEFAULT_MAX_RECORDS);

  const totalRows = processedData.length;
  if (processedData.length > maxRecords) {
    logger.warn(
      `⚠️ Dataset has ${totalRows.toLocaleString()} rows. Loading first ${maxRecords.toLocaleString()} rows for performance.`
    );
    processedData = processedData.slice(0, maxRecords);
  }

  if (processedData.length === 0) {
    return {
      success: false,
      error: 'No valid data found in file',
    };
  }

  // Validate data structure
  const columns = Object.keys(processedData[0]);
  const validationErrors = validateDataStructure(processedData, columns);

  if (validationErrors.length > 0) {
    logger.warn('Data validation warnings:', validationErrors);
  }

  // Enable engine-level synthetic column behavior for imported datasets
  engine.setAutoAllColumn(true);

  // Generate automatic layout based on data content
  const layout = buildAutoLayout(processedData);
  const { rows, columns: columnsAxis, measures, data: augmentedData } = layout;

  // Update the pivot engine with augmented data from layout (includes __all__ if needed)
  engine.updateDataSource(augmentedData as DataRecord[]);

  // Apply automatic layout with proper formatting; engine will synthesize column axis if empty
  engine.setLayout(rows, columnsAxis, measures);

  // Apply conditional formatting if possible
  try {
    if (
      'setConditionalFormatting' in engine &&
      typeof (engine as Record<string, unknown>).setConditionalFormatting ===
        'function'
    ) {
      (
        engine as unknown as {
          setConditionalFormatting: (rules: unknown[]) => void;
        }
      ).setConditionalFormatting([
        {
          value: {
            type: 'Number',
            operator: 'Greater than',
            value1: 1000,
          },
          format: {
            backgroundColor: '#d4edda',
            color: '#155724',
          },
        },
        {
          value: {
            type: 'Number',
            operator: 'Less than',
            value1: 0,
          },
          format: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
          },
        },
      ]);
    }
  } catch (e) {
    logger.warn(
      'Conditional formatting not supported by this engine version:',
      e
    );
  }

  if (totalRows > maxRecords) {
    validationErrors.push(
      `Note: Displaying ${maxRecords.toLocaleString()} of ${totalRows.toLocaleString()} rows for optimal performance.`
    );
  }

  const performanceMode =
    performanceModeOverride ??
    PerformanceConfig.getPerformanceMode(file.size, augmentedData.length);
  const allowDragDrop = PerformanceConfig.isDragDropAllowed(
    augmentedData.length
  );
  const requiresPagination = PerformanceConfig.requiresPagination(
    augmentedData.length
  );

  if (!allowDragDrop) {
    logger.info(
      `Large dataset detected: ${augmentedData.length.toLocaleString()} rows. Virtual scrolling will be used for optimal performance.`
    );
  }

  return {
    success: true,
    data: augmentedData,
    fileName: file.name,
    fileSize: file.size,
    recordCount: augmentedData.length,
    columns,
    validationErrors:
      validationErrors.length > 0 ? validationErrors : undefined,
    performanceMode,
    allowDragDrop,
    requiresPagination,
    parseTime,
  };
}
