/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CSV Parser Web Worker
 * Handles chunked CSV parsing in a separate thread
 */

interface ParseChunkMessage {
  type: 'PARSE_CHUNK';
  chunkId: number;
  text: string;
  isFirstChunk: boolean;
  isLastChunk: boolean;
  delimiter: string;
  headers?: string[];
  leftover?: string;
}

interface ParseResultMessage {
  type: 'CHUNK_PARSED';
  chunkId: number;
  data: any[];
  headers?: string[];
  leftover?: string;
  rowCount: number;
  error?: string;
}

interface ProgressMessage {
  type: 'PROGRESS';
  chunkId: number;
  progress: number;
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCsvLine(line: string, delimiter: string): string[] {
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
 * Convert string value to appropriate type
 */
function convertValue(value: string): any {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  // Remove quotes if present
  const cleaned = value.replace(/^"(.*)"$/, '$1').trim();

  // Try to convert to number
  if (!isNaN(Number(cleaned)) && cleaned !== '') {
    return Number(cleaned);
  }

  // Try to convert to boolean
  if (cleaned.toLowerCase() === 'true') return true;
  if (cleaned.toLowerCase() === 'false') return false;

  // Try to convert to date (only if it looks like a date)
  const dateValue = Date.parse(cleaned);
  if (
    !isNaN(dateValue) &&
    (cleaned.match(/^\d{4}-\d{2}-\d{2}/) || cleaned.includes('/'))
  ) {
    return new Date(dateValue).toISOString().split('T')[0];
  }

  return cleaned;
}

/**
 * Parse a chunk of CSV text
 */
function parseChunk(
  text: string,
  delimiter: string,
  headers: string[] | undefined,
  leftover: string | undefined,
  isFirstChunk: boolean,
  isLastChunk: boolean
): { data: any[]; headers?: string[]; leftover?: string } {
  // Prepend leftover from previous chunk
  const fullText = (leftover || '') + text;

  const lines = fullText.split('\n');

  // If not last chunk, keep the last (potentially incomplete) line for next chunk
  const incompleteLine = !isLastChunk ? lines.pop() : '';

  const data: any[] = [];
  let processedHeaders = headers;
  let startIndex = 0;

  // Process headers if first chunk and no headers provided
  if (isFirstChunk && !processedHeaders) {
    if (lines.length > 0) {
      processedHeaders = parseCsvLine(lines[0], delimiter).map(h => h.trim());
      startIndex = 1;
    }
  }

  // Parse data rows
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line, delimiter);
    if (values.length === 0) continue;

    const row: any = {};
    processedHeaders?.forEach((header, index) => {
      row[header] = convertValue(values[index] || '');
    });

    data.push(row);
  }

  return {
    data,
    headers: isFirstChunk ? processedHeaders : undefined,
    leftover: incompleteLine,
  };
}

// Worker message handler
self.onmessage = (event: MessageEvent<ParseChunkMessage>) => {
  const {
    type,
    chunkId,
    text,
    isFirstChunk,
    isLastChunk,
    delimiter,
    headers,
    leftover,
  } = event.data;

  if (type === 'PARSE_CHUNK') {
    try {
      // Send progress update
      self.postMessage({
        type: 'PROGRESS',
        chunkId,
        progress: 0,
      } as ProgressMessage);

      // Parse the chunk
      const result = parseChunk(
        text,
        delimiter,
        headers,
        leftover,
        isFirstChunk,
        isLastChunk
      );

      // Send parsed result
      self.postMessage({
        type: 'CHUNK_PARSED',
        chunkId,
        data: result.data,
        headers: result.headers,
        leftover: result.leftover,
        rowCount: result.data.length,
      } as ParseResultMessage);
    } catch (error) {
      // Send error
      self.postMessage({
        type: 'CHUNK_PARSED',
        chunkId,
        data: [],
        rowCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ParseResultMessage);
    }
  }
};

export {};
