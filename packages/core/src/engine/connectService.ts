/* eslint-disable @typescript-eslint/no-explicit-any */
import { PivotEngine } from './pivotEngine';
import type { AxisConfig, MeasureConfig } from '../types/interfaces';

type FieldType = 'number' | 'string' | 'date' | 'boolean' | 'null' | 'unknown';

interface AutoLayoutResult {
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  data: any[]; // possibly augmented with __all__
  columnsList: string[];
}

/**
 * Try to parse currency-like strings into a number.
 * Handles symbols ($, €, £, ₹, etc.), spaces, thousands separators and decimal marks
 * including both "," and ".", and negatives in parentheses.
 */
function parseCurrencyToNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;

  let s = input.trim();
  if (!s) return null;

  const hasCurrencySymbol = /[€£¥₹$]/.test(s);
  const hasLetters = /[A-Za-z]/.test(s);
  const hasSeparator = /[.,]/.test(s);
  const hasParenNegRaw = s.startsWith('(') && s.endsWith(')');

  // If contains letters but no currency symbol (e.g., 'value 1'), don't treat as currency/number here
  if (hasLetters && !hasCurrencySymbol) return null;
  // If no currency symbol, no separators and no parentheses negative, leave as-is (handled later by Number/Date checks)
  if (!hasCurrencySymbol && !hasSeparator && !hasParenNegRaw) return null;

  // Detect and handle negatives like (1,234.56)
  let negative = false;
  if (hasParenNegRaw) {
    negative = true;
    s = s.slice(1, -1);
  }

  // Remove currency symbols and any non digit/sep/minus
  // Keep digits, comma, dot, minus
  s = s.replace(/[^0-9,.-]/g, '');

  // If there are multiple minus signs, invalid
  if ((s.match(/-/g) || []).length > 1) return null;
  // Normalize minus position
  s = s.replace(/(.*)-(.*)/, '-$1$2');

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  let normalized = s;

  if (hasDot && hasComma) {
    // Use the rightmost separator as decimal separator
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    normalized = normalized.split(thousandSep).join('');
    normalized = normalized.replace(decimalSep, '.');
  } else if (hasComma && !hasDot) {
    // Only comma present. If multiple commas -> treat all as thousands except possibly the last
    const parts = s.split(',');
    if (parts.length > 2) {
      // Remove all commas, assume integer (rarely has multiple decimal commas)
      normalized = parts.join('');
    } else if (parts.length === 2) {
      // Decide whether comma is decimal or thousand by digits after
      const frac = parts[1];
      if (frac.length === 2 || frac.length === 3) {
        normalized = parts[0] + '.' + frac; // decimal comma
      } else {
        normalized = parts.join(''); // thousands comma
      }
    }
  } else if (hasDot && !hasComma) {
    // Only dot present. If multiple dots, keep the last as decimal, remove others
    const pieces = s.split('.');
    if (pieces.length > 2) {
      const frac = pieces.pop() as string;
      normalized = pieces.join('') + '.' + frac;
    } else {
      normalized = s; // single dot, assume decimal
    }
  } else {
    normalized = s; // no separators, just digits (and maybe minus)
  }

  const n = Number(normalized);
  if (isNaN(n)) return null;
  return negative ? -n : n;
}

/**
 * Infer field types from data sample
 */
function inferFieldTypes(
  data: any[],
  columns: string[]
): Record<string, FieldType> {
  const result: Record<string, FieldType> = {};
  const sample = data.slice(0, Math.min(200, data.length));

  for (const col of columns) {
    let num = 0,
      str = 0,
      date = 0,
      bool = 0,
      nul = 0;
    for (const row of sample) {
      const v = row?.[col];
      if (v === null || v === undefined || v === '') {
        nul++;
        continue;
      }
      if (typeof v === 'number') num++;
      else if (typeof v === 'boolean') bool++;
      else if (typeof v === 'string') {
        // Currency-like strings should count as numbers
        const currencyNum = parseCurrencyToNumber(v);
        if (currencyNum !== null) {
          num++;
          continue;
        }
        const ts = Date.parse(v);
        if (!isNaN(ts) && /\d{4}-\d{2}-\d{2}|\//.test(v)) date++;
        else if (!isNaN(Number(v))) num++;
        else str++;
      } else if (v instanceof Date) date++;
      else str++;
    }
    const counts = { num, str, date, bool, nul } as const;
    const maxKey = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [
      'str',
    ])[0];
    switch (maxKey) {
      case 'num':
        result[col] = 'number';
        break;
      case 'date':
        result[col] = 'date';
        break;
      case 'bool':
        result[col] = 'boolean';
        break;
      case 'str':
        result[col] = 'string';
        break;
      default:
        result[col] = 'unknown';
    }
  }
  return result;
}

/**
 * Build automatic layout based on CSV/JSON data per product rules
 */
function buildAutoLayout(data: any[]): AutoLayoutResult {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  let workingData = data;

  // Single-column CSV special-case
  if (columns.length === 1) {
    const [only] = columns;
    const measures: MeasureConfig[] = [];
    // If the only column is numeric -> add __all__ and make it a measure
    const types = inferFieldTypes(workingData, columns);
    if (types[only] === 'number') {
      workingData = workingData.map(row => ({ ...row, __all__: 'All' }));
      const rows: AxisConfig[] = [{ uniqueName: '__all__', caption: 'All' }];
      // Changed: ensure there is always a column axis
      const columnsAxis: AxisConfig[] = [
        { uniqueName: '__all__', caption: 'All' },
      ];
      measures.push({
        uniqueName: only,
        caption: `Sum of ${only}`,
        aggregation: 'sum',
        format: {
          type: 'number',
          decimals: 2,
          locale: 'en-US',
        },
      });
      return {
        rows,
        columns: columnsAxis,
        measures,
        data: workingData,
        columnsList: ['__all__', ...columns],
      };
    }
    // Otherwise treat it as a row dimension but still create a single synthetic column
    workingData = workingData.map(row => ({ ...row, __all__: 'All' }));
    const rows: AxisConfig[] = [{ uniqueName: only, caption: only }];
    const columnsAxis: AxisConfig[] = [
      { uniqueName: '__all__', caption: 'All' },
    ];
    return {
      rows,
      columns: columnsAxis,
      measures,
      data: workingData,
      columnsList: ['__all__', ...columns],
    };
  }

  // General case
  const types = inferFieldTypes(workingData, columns);
  const numericFields = columns.filter(c => types[c] === 'number');
  const nonNumericFields = columns.filter(c => types[c] !== 'number');

  // Measures: all numeric columns -> sum with proper formatting
  // Apply rule: If a column has all numeric values, set it as a measure
  const measures: MeasureConfig[] = numericFields.map(f => {
    // Detect if the field might contain currency values
    const isCurrency = workingData.some(row => {
      const value = row[f];
      return typeof value === 'string' && /[$€£¥₹]/.test(value);
    });

    return {
      uniqueName: f,
      caption: `Sum of ${f}`,
      aggregation: 'sum',
      format: {
        type: isCurrency ? 'currency' : 'number',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      sortabled: true,
    };
  });

  // Decide rows/columns
  let rows: AxisConfig[] = [];
  let columnsAxis: AxisConfig[] = [];

  // Utility to compute cardinality
  const uniqueCount = (field: string) =>
    new Set(workingData.map(r => r?.[field])).size;
  const totalRows = workingData.length || 1;

  if (nonNumericFields.length === 0) {
    // All numeric -> add __all__ and set both rows and columns as All
    workingData = workingData.map(row => ({ ...row, __all__: 'All' }));
    rows = [{ uniqueName: '__all__', caption: 'All' }];
    columnsAxis = [{ uniqueName: '__all__', caption: 'All' }];
    return {
      rows,
      columns: columnsAxis,
      measures,
      data: workingData,
      columnsList: ['__all__', ...columns],
    };
  }

  // Rank non-numeric fields by cardinality (low to high), prefer repetitive fields
  // Apply rule: If the table has repetitive records for non-numeric columns
  const ranked = nonNumericFields
    .map(f => ({ f, u: uniqueCount(f) }))
    .sort((a, b) => a.u - b.u);

  // Debug logging
  console.log('DEBUG: Non-numeric fields:', nonNumericFields);
  console.log('DEBUG: Ranked fields:', ranked);
  console.log('DEBUG: Total rows:', totalRows);

  // Select candidate dimensions - fields that have more than one unique value
  // but fewer than the total number of rows (indicating repetition)
  const candidateDims = ranked.filter(x => x.u > 1 && x.u < totalRows);

  console.log('DEBUG: Candidate dimensions:', candidateDims);
  console.log(
    'DEBUG: Detailed ranked fields:',
    ranked.map(r => ({ field: r.f, unique: r.u }))
  );

  if (candidateDims.length >= 2) {
    // Use first two most repetitive fields for rows and columns
    // Sort by cardinality first, then apply business logic for common field names
    const sortedCandidates = candidateDims.sort((a, b) => {
      if (a.u !== b.u) return a.u - b.u; // Sort by cardinality first

      // Apply business logic for common field patterns
      const aField = a.f.toLowerCase().trim();
      const bField = b.f.toLowerCase().trim();

      // Common row fields (geographical, organizational hierarchy)
      const rowFields = [
        'region',
        'country',
        'state',
        'city',
        'category',
        'department',
      ];
      // Common column fields (products, time periods, categories)
      const columnFields = [
        'product',
        'item',
        'month',
        'quarter',
        'year',
        'type',
      ];

      const aIsRow = rowFields.some(rf => aField.includes(rf));
      const bIsRow = rowFields.some(rf => bField.includes(rf));
      const aIsColumn = columnFields.some(cf => aField.includes(cf));
      const bIsColumn = columnFields.some(cf => bField.includes(cf));

      console.log('DEBUG: Field comparison:', {
        aField,
        bField,
        aIsRow,
        bIsRow,
        aIsColumn,
        bIsColumn,
      });

      // If one is clearly a row field and the other is not, prioritize the row field
      if (aIsRow && !bIsRow) return -1;
      if (bIsRow && !aIsRow) return 1;

      // If one is clearly a column field and the other is not, the column field goes second
      if (aIsColumn && !bIsColumn) return 1;
      if (bIsColumn && !aIsColumn) return -1;

      // Fall back to alphabetical ordering
      return aField.localeCompare(bField);
    });

    console.log(
      'DEBUG: Sorted candidates:',
      sortedCandidates.map(c => ({ field: c.f, unique: c.u }))
    );

    // Assign the first field to rows, second to columns
    // Ensure we use the exact field names from the data (preserve case and whitespace)
    rows = [
      { uniqueName: sortedCandidates[0].f, caption: sortedCandidates[0].f },
    ];
    columnsAxis = [
      { uniqueName: sortedCandidates[1].f, caption: sortedCandidates[1].f },
    ];

    console.log(
      'DEBUG: Final assignment - Rows:',
      rows,
      'Columns:',
      columnsAxis
    );
  } else if (candidateDims.length === 1) {
    // Only one repetitive non-numeric -> set as rows only
    rows = [
      { uniqueName: candidateDims[0].f, caption: candidateDims[0].f.trim() },
    ];
  } else if (nonNumericFields.length >= 2) {
    // If we have at least 2 non-numeric fields, use the first two even if not highly repetitive
    // Apply the same business logic as above
    const sortedByCardinality = ranked.sort((a, b) => {
      if (a.u !== b.u) return a.u - b.u;

      const aField = a.f.toLowerCase().trim();
      const bField = b.f.toLowerCase().trim();

      const rowFields = [
        'region',
        'country',
        'state',
        'city',
        'category',
        'department',
      ];
      const columnFields = [
        'product',
        'item',
        'month',
        'quarter',
        'year',
        'type',
      ];

      const aIsRow = rowFields.some(rf => aField.includes(rf));
      const bIsRow = rowFields.some(rf => bField.includes(rf));
      const aIsColumn = columnFields.some(cf => aField.includes(cf));
      const bIsColumn = columnFields.some(cf => bField.includes(cf));

      if (aIsRow && !bIsRow) return -1;
      if (bIsRow && !aIsRow) return 1;
      if (aIsColumn && !bIsColumn) return 1;
      if (bIsColumn && !aIsColumn) return -1;

      return aField.localeCompare(bField);
    });
    rows = [
      {
        uniqueName: sortedByCardinality[0].f,
        caption: sortedByCardinality[0].f.trim(),
      },
    ];
    columnsAxis = [
      {
        uniqueName: sortedByCardinality[1].f,
        caption: sortedByCardinality[1].f.trim(),
      },
    ];
  } else {
    // No repetitive non-numeric -> use first non-numeric as rows
    rows = [{ uniqueName: ranked[0].f, caption: ranked[0].f.trim() }];
  }

  // NEW: If no column axis was selected, synthesize a single '__all__' column
  if (!columnsAxis || columnsAxis.length === 0) {
    workingData = workingData.map(row => ({ ...row, __all__: 'All' }));
    columnsAxis = [{ uniqueName: '__all__', caption: 'All' }];
  }

  return {
    rows,
    columns: columnsAxis,
    measures,
    data: workingData,
    columnsList: Object.keys(workingData[0] || {}),
  };
}

/**
 * Interface for file connection result
 */
export interface FileConnectionResult {
  success: boolean;
  data?: any[];
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  columns?: string[];
  error?: string;
  validationErrors?: string[];
}

/**
 * Interface for CSV parsing options
 */
export interface CSVParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  encoding?: string;
}

/**
 * Interface for JSON parsing options
 */
export interface JSONParseOptions {
  arrayPath?: string; // Path to array in nested JSON (e.g., 'data.records')
  validateSchema?: boolean;
}

/**
 * Interface for connection options
 */
export interface ConnectionOptions {
  csv?: CSVParseOptions;
  json?: JSONParseOptions;
  maxFileSize?: number; // in bytes
  maxRecords?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Service class for handling local file connections
 */
export class ConnectService {
  private static readonly DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly DEFAULT_MAX_RECORDS = 100000; // 100k records
  private static readonly SUPPORTED_CSV_EXTENSIONS = ['.csv', '.txt'];
  private static readonly SUPPORTED_JSON_EXTENSIONS = ['.json', '.jsonl'];

  /**
   * Opens a file picker for CSV files and imports data into the pivot engine
   * @param engine - The PivotEngine instance to update
   * @param options - Connection options
   * @returns Promise<FileConnectionResult>
   */
  public static async connectToLocalCSV(
    engine: PivotEngine<any>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const file = await this.openFilePicker(this.SUPPORTED_CSV_EXTENSIONS);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      return await this.processCSVFile(file, engine, options);
    } catch (error) {
      console.error('Error connecting to CSV file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Opens a file picker for JSON files and imports data into the pivot engine
   * @param engine - The PivotEngine instance to update
   * @param options - Connection options
   * @returns Promise<FileConnectionResult>
   */
  public static async connectToLocalJSON(
    engine: PivotEngine<any>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const file = await this.openFilePicker(this.SUPPORTED_JSON_EXTENSIONS);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      return await this.processJSONFile(file, engine, options);
    } catch (error) {
      console.error('Error connecting to JSON file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generic method to connect to any supported file type
   * @param engine - The PivotEngine instance to update
   * @param options - Connection options
   * @returns Promise<FileConnectionResult>
   */
  public static async connectToLocalFile(
    engine: PivotEngine<any>,
    options: ConnectionOptions = {}
  ): Promise<FileConnectionResult> {
    try {
      const allExtensions = [
        ...this.SUPPORTED_CSV_EXTENSIONS,
        ...this.SUPPORTED_JSON_EXTENSIONS,
      ];

      const file = await this.openFilePicker(allExtensions);
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      const fileExtension = this.getFileExtension(file.name);

      if (this.SUPPORTED_CSV_EXTENSIONS.includes(fileExtension)) {
        return await this.processCSVFile(file, engine, options);
      } else if (this.SUPPORTED_JSON_EXTENSIONS.includes(fileExtension)) {
        return await this.processJSONFile(file, engine, options);
      } else {
        return {
          success: false,
          error: `Unsupported file type: ${fileExtension}`,
        };
      }
    } catch (error) {
      console.error('Error connecting to local file:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Opens a file picker dialog
   * @private
   */
  private static openFilePicker(extensions: string[]): Promise<File | null> {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = extensions.join(',');
      input.style.display = 'none';

      input.onchange = event => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0] || null;
        document.body.removeChild(input);
        resolve(file);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Processes a CSV file and updates the pivot engine
   * @private
   */
  private static async processCSVFile(
    file: File,
    engine: PivotEngine<any>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    const validationResult = this.validateFile(file, options);
    if (!validationResult.success) {
      return validationResult;
    }

    try {
      const csvOptions = {
        delimiter: ',',
        hasHeader: true,
        skipEmptyLines: true,
        trimValues: true,
        ...options.csv,
      };

      const text = await this.readFileAsText(file, options.onProgress);
      let parsedData = this.parseCSV(text, csvOptions);

      // Apply record limit (use default if not provided)
      const maxRecords = options.maxRecords ?? this.DEFAULT_MAX_RECORDS;
      if (parsedData.length > maxRecords) {
        parsedData = parsedData.slice(0, maxRecords);
      }

      if (parsedData.length === 0) {
        return {
          success: false,
          error: 'No valid data found in CSV file',
        };
      }

      // Validate data structure
      const columns = Object.keys(parsedData[0]);
      const validationErrors = this.validateDataStructure(parsedData, columns);

      if (validationErrors.length > 0) {
        console.warn('Data validation warnings:', validationErrors);
      }

      // Process and normalize the data
      const processedData = this.processCSVData(parsedData);

      // Enable engine-level synthetic column behavior for imported datasets
      engine.setAutoAllColumn(true);

      // Update the pivot engine with new data (engine will handle '__all__' if needed)
      engine.updateDataSource(processedData);

      // Generate automatic layout based on data content
      const layout = buildAutoLayout(processedData);
      const { rows, columns: initialColumnsAxis, measures } = layout as any;
      const columnsAxis = initialColumnsAxis as AxisConfig[];

      // Apply automatic layout with proper formatting; engine will synthesize column axis if empty
      engine.setLayout(rows, columnsAxis, measures);

      // Apply conditional formatting if possible
      // Use a try/catch block since we're not sure if the engine supports this feature
      try {
        const anyEngine = engine as any;
        if (typeof anyEngine.setConditionalFormatting === 'function') {
          anyEngine.setConditionalFormatting([
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
        console.warn(
          'Conditional formatting not supported by this engine version:',
          e
        );
      }

      return {
        success: true,
        data: processedData,
        fileName: file.name,
        fileSize: file.size,
        recordCount: processedData.length,
        // Return original columns (exclude helper fields like __all__)
        columns,
        validationErrors:
          validationErrors.length > 0 ? validationErrors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Processes a JSON file and updates the pivot engine
   * @private
   */
  private static async processJSONFile(
    file: File,
    engine: PivotEngine<any>,
    options: ConnectionOptions
  ): Promise<FileConnectionResult> {
    const validationResult = this.validateFile(file, options);
    if (!validationResult.success) {
      return validationResult;
    }

    try {
      const text = await this.readFileAsText(file, options.onProgress);
      const jsonData = JSON.parse(text);

      // Extract array data based on arrayPath option
      let arrayData: any[] = [];

      if (options.json?.arrayPath) {
        arrayData = this.extractArrayFromPath(jsonData, options.json.arrayPath);
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

      // Apply record limit (use default if not provided)
      const maxRecords = options.maxRecords ?? this.DEFAULT_MAX_RECORDS;
      if (arrayData.length > maxRecords) {
        arrayData = arrayData.slice(0, maxRecords);
      }

      // Validate data structure
      const columns = Object.keys(arrayData[0] || {});
      const validationErrors = this.validateDataStructure(arrayData, columns);

      if (validationErrors.length > 0) {
        console.warn('Data validation warnings:', validationErrors);
      }

      // Enable engine-level synthetic column behavior for imported datasets
      engine.setAutoAllColumn(true);

      // Update the pivot engine with new data (engine will handle '__all__' if needed)
      engine.updateDataSource(arrayData);

      const layout = buildAutoLayout(arrayData);
      const { rows, columns: initialColumnsAxis, measures } = layout as any;
      const columnsAxis = initialColumnsAxis as AxisConfig[];

      // Apply automatic layout; engine will synthesize column axis if empty
      engine.setLayout(rows, columnsAxis, measures);

      return {
        success: true,
        data: arrayData,
        fileName: file.name,
        fileSize: file.size,
        recordCount: arrayData.length,
        // Return original columns (exclude helper fields like __all__)
        columns,
        validationErrors:
          validationErrors.length > 0 ? validationErrors : undefined,
      };
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
   * Validates file before processing
   * @private
   */
  private static validateFile(
    file: File,
    options: ConnectionOptions
  ): FileConnectionResult {
    const maxSize = options.maxFileSize || this.DEFAULT_MAX_FILE_SIZE;

    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`,
      };
    }

    const extension = this.getFileExtension(file.name);
    const allSupportedExtensions = [
      ...this.SUPPORTED_CSV_EXTENSIONS,
      ...this.SUPPORTED_JSON_EXTENSIONS,
    ];

    if (!allSupportedExtensions.includes(extension)) {
      return {
        success: false,
        error: `Unsupported file type: ${extension}. Supported types: ${allSupportedExtensions.join(', ')}`,
      };
    }

    return { success: true };
  }

  /**
   * Reads file as text with optional progress callback
   * @private
   */
  private static readFileAsText(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (onProgress) {
        reader.onprogress = event => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };
      }

      reader.readAsText(file);
    });
  }

  /**
   * Parses CSV text into array of objects
   * @private
   */
  private static parseCSV(text: string, options: CSVParseOptions): any[] {
    const lines = text
      .split('\n')
      .filter(line => (options.skipEmptyLines ? line.trim() !== '' : true));

    if (lines.length === 0) return [];

    const delimiter = options.delimiter || ',';
    let headers: string[] = [];
    let dataStartIndex = 0;

    if (options.hasHeader) {
      headers = this.parseCsvLine(lines[0], delimiter);
      if (options.trimValues) {
        headers = headers.map(h => h.trim());
      }
      dataStartIndex = 1;
    } else {
      // Generate headers if not present
      const firstLine = this.parseCsvLine(lines[0], delimiter);
      headers = firstLine.map((_, index) => `Column_${index + 1}`);
    }

    const data: any[] = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);

      if (values.length === 0) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';

        if (options.trimValues) {
          value = value.trim();
        }

        // Try to convert to appropriate data type (with currency support)
        row[header] = this.convertValue(value);
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Parses a single CSV line handling quoted values
   * @private
   */
  private static parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] === delimiter || inQuotes)) {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Converts string values to appropriate data types
   * @private
   */
  private static convertValue(value: string): any {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    // Remove quotes if present
    const cleaned = value.replace(/^"(.*)"$/, '$1');

    // Try to convert currency-like values first
    const currencyNum = parseCurrencyToNumber(cleaned);
    if (currencyNum !== null) return currencyNum;

    // Try to convert to number
    if (!isNaN(Number(cleaned)) && cleaned !== '') {
      return Number(cleaned);
    }

    // Try to convert to boolean
    if (cleaned.toLowerCase() === 'true') return true;
    if (cleaned.toLowerCase() === 'false') return false;

    // Try to convert to date
    const dateValue = Date.parse(cleaned);
    if (
      (!isNaN(dateValue) && cleaned.match(/^\d{4}-\d{2}-\d{2}/)) ||
      cleaned.includes('/')
    ) {
      return new Date(dateValue).toISOString().split('T')[0]; // Return as date string
    }

    return cleaned;
  }

  /**
   * Extracts array from nested JSON using dot notation path
   * @private
   */
  private static extractArrayFromPath(obj: any, path: string): any[] {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return [];
      }
    }

    return Array.isArray(current) ? current : [];
  }

  /**
   * Validates data structure and returns warnings
   * @private
   */
  private static validateDataStructure(
    data: any[],
    columns: string[]
  ): string[] {
    const warnings: string[] = [];

    if (columns.length === 0) {
      warnings.push('No columns detected in data');
      return warnings;
    }

    // Check for empty column names
    const emptyColumns = columns.filter(col => !col || col.trim() === '');
    if (emptyColumns.length > 0) {
      warnings.push(`Found ${emptyColumns.length} columns with empty names`);
    }

    // Check for duplicate column names
    const duplicates = columns.filter(
      (col, index) => columns.indexOf(col) !== index
    );
    if (duplicates.length > 0) {
      warnings.push(
        `Found duplicate column names: ${[...new Set(duplicates)].join(', ')}`
      );
    }

    // Check data consistency (sample first 100 rows)
    const sampleSize = Math.min(100, data.length);
    const inconsistentRows = [] as number[];

    for (let i = 0; i < sampleSize; i++) {
      const row = data[i];
      const rowKeys = Object.keys(row);

      if (rowKeys.length !== columns.length) {
        inconsistentRows.push(i + 1);
      }
    }

    if (inconsistentRows.length > 0) {
      warnings.push(
        `Found ${inconsistentRows.length} rows with inconsistent column count in sample`
      );
    }

    return warnings;
  }

  /**
   * Gets file extension from filename
   * @private
   */
  private static getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  /**
   * Formats file size for human reading
   * @private
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Creates a summary of the import result
   * @param result - The file connection result
   * @returns A formatted summary string
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
      summary += `\nFile size: ${this.formatFileSize(result.fileSize)}`;
    }

    if (result.validationErrors && result.validationErrors.length > 0) {
      summary += `\n\nWarnings:\n${result.validationErrors.map(w => `• ${w}`).join('\n')}`;
    }

    return summary;
  }

  /**
   * Shows a browser notification for import results
   * @param result - The file connection result
   */
  public static showImportNotification(result: FileConnectionResult): void {
    const message = this.createImportSummary(result);

    // Prefer the Web Notifications API if available and permitted
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
            // Fallback if permission denied or default
            console.log(message);
          }
        });
        return;
      }
    }

    // Final fallback
    console.log(message);
  }

  /**
   * Process CSV data to normalize and prepare it for the pivot engine
   * @private
   */
  private static processCSVData(data: any[]): any[] {
    if (!data || data.length === 0) return data;

    // Make a deep copy to avoid modifying the original data
    const processedData = JSON.parse(JSON.stringify(data));

    const columns = Object.keys(processedData[0]);
    const types = inferFieldTypes(processedData, columns);

    // Convert all strings that could be numbers to numbers
    for (const row of processedData) {
      for (const col of columns) {
        if (types[col] === 'number' && typeof row[col] === 'string') {
          const parsed = parseFloat(row[col]);
          if (!isNaN(parsed)) {
            row[col] = parsed;
          }
        }
      }
    }

    return processedData;
  }
}
