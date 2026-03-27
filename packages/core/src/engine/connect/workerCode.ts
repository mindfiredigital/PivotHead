/**
 * Get worker code as string for blob URL creation
 * Worker code is inlined to avoid bundling issues
 */
export function getWorkerCode(): string {
  return `
/* CSV Parser Worker */
function parseCsvLine(line, delimiter) {
  const result = [];
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

function convertValue(value) {
  if (value === '' || value === null || value === undefined) return null;
  const cleaned = value.replace(/^"(.*)"$/, '$1').trim();
  if (!isNaN(Number(cleaned)) && cleaned !== '') return Number(cleaned);
  if (cleaned.toLowerCase() === 'true') return true;
  if (cleaned.toLowerCase() === 'false') return false;
  const dateValue = Date.parse(cleaned);
  if (!isNaN(dateValue) && (cleaned.match(/^\\d{4}-\\d{2}-\\d{2}/) || cleaned.includes('/'))) {
    return new Date(dateValue).toISOString().split('T')[0];
  }
  return cleaned;
}

function parseChunk(text, delimiter, headers, leftover, isFirstChunk, isLastChunk) {
  const fullText = (leftover || '') + text;
  const lines = fullText.split('\\n');
  const incompleteLine = !isLastChunk ? lines.pop() : '';
  const data = [];
  let processedHeaders = headers;
  let startIndex = 0;

  if (isFirstChunk && !processedHeaders) {
    if (lines.length > 0) {
      processedHeaders = parseCsvLine(lines[0], delimiter).map(h => h.trim());
      startIndex = 1;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line, delimiter);
    if (values.length === 0) continue;
    const row = {};
    processedHeaders?.forEach((header, index) => {
      row[header] = convertValue(values[index] || '');
    });
    data.push(row);
  }

  return { data, headers: isFirstChunk ? processedHeaders : undefined, leftover: incompleteLine };
}

self.onmessage = (event) => {
  const { type, chunkId, text, isFirstChunk, isLastChunk, delimiter, headers, leftover } = event.data;
  if (type === 'PARSE_CHUNK') {
    try {
      self.postMessage({ type: 'PROGRESS', chunkId, progress: 0 });
      const result = parseChunk(text, delimiter, headers, leftover, isFirstChunk, isLastChunk);
      self.postMessage({
        type: 'CHUNK_PARSED',
        chunkId,
        data: result.data,
        headers: result.headers,
        leftover: result.leftover,
        rowCount: result.data.length,
      });
    } catch (error) {
      self.postMessage({
        type: 'CHUNK_PARSED',
        chunkId,
        data: [],
        rowCount: 0,
        error: error.message || 'Unknown error',
      });
    }
  }
};
`;
}
