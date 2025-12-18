/**
 * High-Performance CSV Parser (TypeScript)
 *
 * This module provides a fast CSV parsing implementation adapted
 * from AssemblyScript to TypeScript for use in Node/browser.
 */

// Constants
const COMMA: number = 44; // ','
const QUOTE: number = 34; // '"'
const NEWLINE: number = 10; // '\n'
const CARRIAGE: number = 13; // '\r'
const SPACE: number = 32; // ' '
const TAB: number = 9; // '\t'

/**
 * Parse state for tracking parser position
 */
class ParseState {
  position: number = 0;
  currentRow: number = 0;
  currentCol: number = 0;
  inQuotes: boolean = false;
  fieldStart: number = 0;
}

/**
 * Result of CSV parsing (internal use only)
 */
class CSVResult {
  rowCount: number = 0;
  colCount: number = 0;
  errorCode: number = 0; // 0 = success, 1 = error
  errorMessage: string = '';
}

// Export individual result getters instead of the class
let lastResult: CSVResult = new CSVResult();

export function getLastRowCount(): number {
  return lastResult.rowCount;
}

export function getLastColCount(): number {
  return lastResult.colCount;
}

export function getLastErrorCode(): number {
  return lastResult.errorCode;
}

export function getLastErrorMessage(): string {
  return lastResult.errorMessage;
}

/**
 * Parse a CSV chunk and store results internally
 * Use getLastRowCount(), getLastColCount(), etc. to retrieve results
 *
 * @param input - CSV data as string
 * @param delimiter - Field delimiter (default: comma)
 * @param hasHeader - Whether first row is header
 * @param trimValues - Trim whitespace from values
 * @returns Error code (0 = success, 1 = error)
 */
export function parseCSVChunk(
  input: string,
  delimiter: number = COMMA,
  hasHeader: boolean = true,
  trimValues: boolean = true
): number {
  lastResult = new CSVResult();

  if (input.length === 0) {
    lastResult.errorCode = 1;
    lastResult.errorMessage = 'Empty input';
    return 1;
  }

  const state = new ParseState();
  const length = input.length;
  let rows = 0;
  let cols = 0;
  let maxCols = 0;

  // First pass: count rows and columns
  while (state.position < length) {
    const char = input.charCodeAt(i32(state.position));

    if (char === QUOTE) {
      state.inQuotes = !state.inQuotes;
    } else if (!state.inQuotes) {
      if (char === delimiter) {
        cols++;
      } else if (
        char === NEWLINE ||
        (char === CARRIAGE &&
          state.position + 1 < length &&
          input.charCodeAt(i32(state.position + 1)) === NEWLINE)
      ) {
        cols++; // Count last column
        if (cols > maxCols) {
          maxCols = cols;
        }
        rows++;
        cols = 0;

        // Skip \r\n
        if (char === CARRIAGE && state.position + 1 < length) {
          state.position++;
        }
      }
    }

    state.position++;
  }

  // Handle last row if no trailing newline
  if (cols > 0) {
    if (cols > maxCols) {
      maxCols = cols;
    }
    rows++;
  }

  lastResult.rowCount = rows;
  lastResult.colCount = maxCols;
  lastResult.errorCode = 0;

  return 0; // Success
}

/**
 * Extract a field value from CSV data
 *
 * @param input - CSV string
 * @param start - Start position
 * @param end - End position
 * @param trimValues - Whether to trim whitespace
 * @returns Extracted field value
 */
export function extractField(
  input: string,
  start: number,
  end: number,
  trimValues: boolean
): string {
  if (start >= end) {
    return '';
  }

  let value = input.substring(i32(start), i32(end));

  // Remove quotes if present
  if (
    value.length >= 2 &&
    value.charCodeAt(0) === QUOTE &&
    value.charCodeAt(value.length - 1) === QUOTE
  ) {
    value = value.substring(1, value.length - 1);
    // Unescape double quotes
    value = value.replaceAll('""', '"');
  }

  // Trim whitespace if requested
  if (trimValues) {
    value = value.trim();
  }

  return value;
}

/**
 * Fast number parsing
 *
 * @param input - String to parse
 * @returns Parsed number or NaN
 */
export function parseNumber(input: string): number {
  if (input.length === 0) {
    return NaN;
  }

  // Remove whitespace
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return NaN;
  }

  // Check for number format
  let isNegative = false;
  let hasDecimal = false;
  let position = 0;

  if (trimmed.charCodeAt(0) === 45) {
    // '-'
    isNegative = true;
    position = 1;
  }

  let intPart: number = 0;
  let fracPart: number = 0;
  let fracDivisor: number = 1;

  // Parse integer part
  while (position < trimmed.length) {
    const char = trimmed.charCodeAt(position);

    if (char >= 48 && char <= 57) {
      // '0'-'9'
      if (!hasDecimal) {
        intPart = intPart * 10 + (char - 48);
      } else {
        fracDivisor *= 10;
        fracPart = fracPart * 10 + (char - 48);
      }
    } else if (char === 46) {
      // '.'
      if (hasDecimal) {
        return NaN; // Multiple decimal points
      }
      hasDecimal = true;
    } else {
      return NaN; // Invalid character
    }

    position++;
  }

  let result = intPart;
  if (hasDecimal) {
    result += fracPart / fracDivisor;
  }

  return isNegative ? -result : result;
}

/**
 * Detect field type from value
 *
 * @param value - Field value
 * @returns Type: 0=string, 1=number, 2=boolean, 3=null
 */
export function detectFieldType(value: string): number {
  if (value.length === 0 || value === 'null' || value === 'NULL') {
    return 3; // null
  }

  if (
    value === 'true' ||
    value === 'false' ||
    value === 'TRUE' ||
    value === 'FALSE'
  ) {
    return 2; // boolean
  }

  // Try to parse as number
  const num = parseNumber(value);
  if (!isNaN(num)) {
    return 1; // number
  }

  return 0; // string
}

/**
 * Calculate memory usage for parsed data
 *
 * @param rowCount - Number of rows
 * @param colCount - Number of columns
 * @returns Estimated memory in bytes
 */
export function estimateMemory(rowCount: number, colCount: number): number {
  // Rough estimate: 64 bytes per cell (pointers + overhead)
  return rowCount * colCount * 64;
}

/**
 * Initialize module
 */
export function initialize(): void {
  // Initialization code if needed
  lastResult = new CSVResult();
}

/**
 * Get module version
 */
export function getVersion(): string {
  return '1.0.0';
}

/**
 * Benchmark: Parse performance test
 *
 * @param input - Test CSV data
 * @returns Parse time in milliseconds (simulated)
 */
export function benchmark(input: string): number {
  parseCSVChunk(input);
  const rowCount = getLastRowCount();
  return rowCount * 0.001; // Simulated timing
}
