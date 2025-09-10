/* eslint-disable @typescript-eslint/no-explicit-any */
import { PivotEngine } from './pivotEngine';

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
      const file = await this.openFilePicker(
        this.SUPPORTED_CSV_EXTENSIONS,
        'CSV'
      );
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
      const file = await this.openFilePicker(
        this.SUPPORTED_JSON_EXTENSIONS,
        'JSON'
      );
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

      const file = await this.openFilePicker(allExtensions, 'CSV and JSON');
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
  private static openFilePicker(
    extensions: string[],
    description: string
  ): Promise<File | null> {
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
      const parsedData = this.parseCSV(text, csvOptions);

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

      // Update the pivot engine with new data
      engine.updateDataSource(parsedData);

      return {
        success: true,
        data: parsedData,
        fileName: file.name,
        fileSize: file.size,
        recordCount: parsedData.length,
        columns: columns,
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

      // Validate data structure
      const columns = Object.keys(arrayData[0] || {});
      const validationErrors = this.validateDataStructure(arrayData, columns);

      if (validationErrors.length > 0) {
        console.warn('Data validation warnings:', validationErrors);
      }

      // Update the pivot engine with new data
      engine.updateDataSource(arrayData);

      return {
        success: true,
        data: arrayData,
        fileName: file.name,
        fileSize: file.size,
        recordCount: arrayData.length,
        columns: columns,
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

        // Try to convert to appropriate data type
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
    const inconsistentRows = [];

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
    if (result.success) {
      console.log('Import successful:', this.createImportSummary(result));
      // You can replace this with your preferred notification system
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Import Successful', {
            body: `Imported ${result.recordCount} records from ${result.fileName}`,
            icon: '/favicon.ico', // Replace with your app icon
          });
        }
      }
    } else {
      console.error('Import failed:', result.error);
    }
  }
}
