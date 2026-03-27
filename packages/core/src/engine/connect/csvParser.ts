import type { CSVParseOptions, DataRecord } from '../../types/interfaces';
import { parseCurrencyToNumber } from './currencyParser';
import { inferFieldTypes } from './fieldTypeInference';

/**
 * Parses CSV text into array of objects
 */
export function parseCSV(text: string, options: CSVParseOptions): DataRecord[] {
  const lines = text
    .split('\n')
    .filter(line => (options.skipEmptyLines ? line.trim() !== '' : true));

  if (lines.length === 0) return [];

  const delimiter = options.delimiter || ',';
  let headers: string[] = [];
  let dataStartIndex = 0;

  if (options.hasHeader) {
    headers = parseCsvLine(lines[0], delimiter);
    if (options.trimValues) {
      headers = headers.map(h => h.trim());
    }
    dataStartIndex = 1;
  } else {
    // Generate headers if not present
    const firstLine = parseCsvLine(lines[0], delimiter);
    headers = firstLine.map((_, index) => `Column_${index + 1}`);
  }

  const data: DataRecord[] = [];

  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter);

    if (values.length === 0) continue;

    const row: DataRecord = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';

      if (options.trimValues) {
        value = value.trim();
      }

      // Try to convert to appropriate data type (with currency support)
      row[header] = convertValue(value);
    });

    data.push(row);
  }

  return data;
}

/**
 * Parses a single CSV line handling quoted values
 */
export function parseCsvLine(line: string, delimiter: string): string[] {
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
 */
export function convertValue(value: string): unknown {
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
    !isNaN(dateValue) &&
    (cleaned.match(/^\d{4}-\d{2}-\d{2}/) || cleaned.includes('/'))
  ) {
    return new Date(dateValue).toISOString().split('T')[0]; // Return as date string
  }

  return cleaned;
}

/**
 * Process CSV data to normalize and prepare it for the pivot engine
 */
export function processCSVData(data: DataRecord[]): DataRecord[] {
  if (!data || data.length === 0) return data;

  // Make a deep copy to avoid modifying the original data
  const processedData: DataRecord[] = JSON.parse(JSON.stringify(data));

  const columns = Object.keys(processedData[0]);
  const types = inferFieldTypes(processedData, columns);

  // Convert all strings that could be numbers to numbers
  for (const row of processedData) {
    for (const col of columns) {
      if (types[col] === 'number' && typeof row[col] === 'string') {
        const parsed = parseFloat(row[col] as string);
        if (!isNaN(parsed)) {
          row[col] = parsed;
        }
      }
    }
  }

  return processedData;
}
