/**
 * CSV parsing utility for the React web component demo.
 *
 * Uses WebAssembly (via WasmLoader from @mindfiredigital/pivothead) for
 * per-value type detection and number parsing — the fast operations WASM
 * is reliable at in the browser.
 *
 * Row/column splitting is always done in JavaScript. Passing the full CSV
 * text into WASM via __newString is unreliable for large inputs because
 * AssemblyScript's managed-memory allocation can fail silently, causing
 * the WASM module to see an empty string.
 *
 * Falls back to plain JavaScript type inference when WASM is unavailable.
 */

import { WasmLoader } from '@mindfiredigital/pivothead';

// ─── WASM singleton ───────────────────────────────────────────────────────────

let _loader = null;
let _ready = false;

/**
 * Initialize the WASM module.
 * Safe to call multiple times — only loads once.
 * Returns true if WASM loaded successfully, false if JS fallback will be used.
 */
export async function initWasm() {
  if (_ready) return true;

  try {
    if (typeof WebAssembly === 'undefined') {
      console.warn(
        'WebAssembly not supported in this browser — using JS fallback.'
      );
      return false;
    }

    _loader = WasmLoader.getInstance();
    await _loader.load();
    _ready = _loader.isModuleLoaded();

    if (_ready) {
      console.log(`✅ WASM CSV parser loaded (v${_loader.getVersion()})`);
    }
    return _ready;
  } catch (err) {
    console.warn('⚠️ WASM init failed, will use JS fallback:', err.message);
    _ready = false;
    return false;
  }
}

export function isWasmReady() {
  return _ready;
}

// ─── CSV row parser (JavaScript) ─────────────────────────────────────────────

/**
 * Parse a CSV string into an array of string arrays.
 * Handles quoted fields and escaped quotes ("").
 */
function parseCSVRows(text, delimiter = ',') {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && next === '\n') i++;
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += ch;
      }
    }
  }

  // Last field/row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) rows.push(currentRow);
  }

  return rows;
}

// ─── Type detection ───────────────────────────────────────────────────────────

/**
 * Detect and coerce a raw string value to the appropriate JS type.
 * Uses WASM when available for accurate type inference.
 */
function coerceValue(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;

  // Try WASM type detection first
  if (_ready && _loader) {
    try {
      const type = _loader.detectFieldType(raw);
      switch (type) {
        case 1:
          return _loader.parseNumber(raw); // number
        case 2:
          return raw.toLowerCase() === 'true'; // boolean
        case 3:
          return null; // null/empty
        default:
          return raw; // string
      }
    } catch {
      // Fall through to JS detection
    }
  }

  // JS fallback
  if (raw === 'true' || raw === 'false') return raw === 'true';
  const num = Number(raw);
  return isNaN(num) ? raw : num;
}

// ─── Main parse function ──────────────────────────────────────────────────────

/**
 * Parse a CSV text string.
 *
 * Row/column splitting is done in JS (reliable for any input size).
 * WASM is used for per-value type detection and number parsing when available.
 *
 * @returns {{ data, headers, rowCount, colCount, parseTime, method }}
 *   - data: array of objects (one per row)
 *   - headers: array of column names
 *   - rowCount: number of data rows (excl. header)
 *   - colCount: number of columns
 *   - parseTime: ms taken
 *   - method: 'wasm' | 'js'  (reflects whether WASM was used for type detection)
 */
export async function parseCSV(text) {
  const start = performance.now();

  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error(
      'No content found in the file. Make sure it is a valid CSV.'
    );
  }

  // Row/column splitting always in JS — passing full text to WASM via
  // __newString is unreliable for large inputs (allocation may fail silently).
  const rows = parseCSVRows(text);

  if (rows.length < 1) {
    throw new Error('No rows found. Make sure the CSV has a header row.');
  }
  if (rows.length < 2) {
    throw new Error(
      'CSV has a header but no data rows. Add at least one data row.'
    );
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Convert rows to typed objects.
  // coerceValue() uses WASM for type detection when available.
  const data = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = coerceValue(row[i] ?? '');
    });
    return obj;
  });

  // Report 'wasm' if WASM was available for type coercion
  const method = _ready ? 'wasm' : 'js';

  console.log(
    `✅ Parsed ${dataRows.length} rows × ${headers.length} cols in` +
      ` ${(performance.now() - start).toFixed(1)}ms [${method}]`
  );

  return {
    data,
    headers,
    rowCount: dataRows.length,
    colCount: headers.length,
    parseTime: performance.now() - start,
    method,
  };
}

// ─── Pivot option auto-detection ─────────────────────────────────────────────

/**
 * Analyse the parsed data and return a sensible PivotEngine options object.
 *
 * Heuristic:
 *   - Columns where >70% of sampled values are numbers → measures (sum)
 *   - Other columns → string dimensions; first one → rows, second → columns
 */
export function detectPivotOptions(data, headers) {
  if (!data.length || !headers.length) return null;

  const sample = data.slice(0, Math.min(50, data.length));

  const numericHeaders = [];
  const stringHeaders = [];

  headers.forEach(h => {
    const numericCount = sample.filter(
      r => typeof r[h] === 'number' && !isNaN(r[h])
    ).length;
    if (numericCount > sample.length * 0.7) {
      numericHeaders.push(h);
    } else {
      stringHeaders.push(h);
    }
  });

  // Edge case: no numeric columns → treat all as dimensions, no measures
  if (numericHeaders.length === 0) {
    return {
      rows: headers.slice(0, 1).map(h => ({ uniqueName: h, caption: h })),
      columns: headers.slice(1, 2).map(h => ({ uniqueName: h, caption: h })),
      measures: [],
    };
  }

  // Edge case: no string columns → treat all as measures, no dimensions
  if (stringHeaders.length === 0) {
    return {
      rows: [],
      columns: [],
      measures: numericHeaders.map(h => ({
        uniqueName: h,
        caption: formatCaption(h),
        aggregation: 'sum',
      })),
    };
  }

  return {
    rows: [
      {
        uniqueName: stringHeaders[0],
        caption: formatCaption(stringHeaders[0]),
      },
    ],
    columns:
      stringHeaders.length > 1
        ? [
            {
              uniqueName: stringHeaders[1],
              caption: formatCaption(stringHeaders[1]),
            },
          ]
        : [],
    measures: numericHeaders.map(h => ({
      uniqueName: h,
      caption: formatCaption(h),
      aggregation: 'sum',
    })),
  };
}

/** Convert snake_case / camelCase / kebab-case headers to Title Case labels */
function formatCaption(header) {
  return header
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}
