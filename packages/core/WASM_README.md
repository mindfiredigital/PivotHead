# 🚀 WebAssembly Integration for PivotHead

## Overview

PivotHead now includes **WebAssembly (WASM)** support for blazing-fast CSV processing, providing near-native performance for large datasets (10MB+ files or 50k+ rows).

## Features

✅ **High-Performance CSV Parsing** - Up to 10x faster than JavaScript for large files
✅ **Automatic Fallback** - Falls back to Web Workers if WASM fails
✅ **Type Detection** - Intelligent type inference in WASM
✅ **Memory Efficient** - Optimized memory usage for massive datasets
✅ **Browser Compatible** - Works in all modern browsers with WebAssembly support

---

## Performance Thresholds

| Technology      | Trigger Condition            |
| --------------- | ---------------------------- |
| **WebAssembly** | File ≥ 10MB OR Rows ≥ 50,000 |
| **Web Workers** | File ≥ 5MB OR Rows ≥ 10,000  |
| **Standard**    | File < 5MB AND Rows < 10,000 |

---

## Installation & Build

### 1. Install Dependencies

The AssemblyScript dependencies are already included in `package.json`:

```json
{
  "devDependencies": {
    "assemblyscript": "^0.27.33",
    "@assemblyscript/loader": "^0.27.33"
  }
}
```

Install them:

```bash
pnpm install
```

### 2. Build WASM Module

Compile the AssemblyScript code to WebAssembly:

```bash
# Production build (optimized)
npm run build:wasm

# Debug build (with debugging symbols)
npm run build:wasm:debug
```

This creates:

- `dist/wasm/csvParser.wasm` - Production WASM module
- `dist/wasm/csvParser.debug.wasm` - Debug WASM module (optional)

### 3. Build the Complete Package

```bash
npm run build
```

This will:

1. Build WASM modules
2. Bundle TypeScript/JavaScript code
3. Include WASM files in the distribution

---

## Usage

### Automatic WASM Usage

WASM is **automatically used** when file size/row count exceeds thresholds:

```typescript
import { ConnectService } from '@mindfiredigital/pivothead';

// Upload large CSV (>10MB)
const result = await ConnectService.connectToLocalCSV(pivotEngine);

// Console output:
// 🚀 Very large file detected (21.38 MB). Attempting WebAssembly processing...
// ✅ WASM parsing completed in 0.85s
// 📊 Processed 100,000 rows, 40 columns
```

### Manual WASM Usage

You can also use the WASM processor directly:

```typescript
import { getWasmCSVProcessor } from '@mindfiredigital/pivothead';

const processor = getWasmCSVProcessor();

// Initialize WASM
await processor.initialize();

// Process CSV file
const result = await processor.processFile(file, {
  delimiter: ',',
  hasHeader: true,
  trimValues: true,
  skipEmptyLines: true,
});

console.log(`Processed ${result.rowCount} rows in ${result.parseTime}ms`);
```

---

## API Reference

### WasmCSVProcessor

#### Methods

##### `initialize(): Promise<boolean>`

Initialize the WASM module. Returns `true` if successful.

```typescript
const processor = getWasmCSVProcessor();
const success = await processor.initialize();
```

##### `processFile(file: File, options?: WasmProcessOptions): Promise<WasmProcessResult>`

Process a CSV file using WASM.

**Options:**

```typescript
interface WasmProcessOptions {
  delimiter?: string; // Default: ','
  hasHeader?: boolean; // Default: true
  trimValues?: boolean; // Default: true
  skipEmptyLines?: boolean; // Default: true
}
```

**Result:**

```typescript
interface WasmProcessResult {
  success: boolean;
  data: any[]; // Parsed data objects
  headers?: string[]; // Column headers
  rowCount: number; // Number of rows
  colCount: number; // Number of columns
  parseTime: number; // Parse time in ms
  error?: string; // Error message if failed
}
```

##### `processCSV(csvData: string, options?: WasmProcessOptions): Promise<WasmProcessResult>`

Process CSV string data.

##### `estimateMemory(rowCount: number, colCount: number): number`

Estimate memory usage for a dataset.

```typescript
const memoryBytes = processor.estimateMemory(100000, 40);
console.log(`Estimated memory: ${(memoryBytes / 1024 / 1024).toFixed(2)} MB`);
```

##### `getVersion(): string`

Get WASM module version.

##### `cleanup(): void`

Release WASM resources.

---

## AssemblyScript Functions

The WASM module (`assembly/csvParser.ts`) provides these high-performance functions:

### `parseCSVChunk(input, delimiter, hasHeader, trimValues): CSVResult`

Parse CSV data and return row/column counts with error handling.

### `extractField(input, start, end, trimValues): string`

Extract and clean a single CSV field.

### `parseNumber(input): f64`

Fast number parsing (faster than JavaScript's `parseFloat`).

### `detectFieldType(value): i32`

Detect field type: 0=string, 1=number, 2=boolean, 3=null.

### `estimateMemory(rowCount, colCount): i32`

Calculate estimated memory usage.

---

## Performance Comparison

### Benchmark: 100k rows × 40 columns (21.38 MB)

| Method                   | Parse Time | Speedup |
| ------------------------ | ---------- | ------- |
| **WebAssembly**          | ~0.85s     | **10x** |
| Web Workers (11 workers) | ~1.67s     | 5x      |
| Standard JavaScript      | ~8.5s      | 1x      |

_Results may vary based on hardware and dataset_

---

## Browser Compatibility

WebAssembly is supported in:

- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Edge 16+
- ✅ Opera 44+

For unsupported browsers, the system automatically falls back to Web Workers.

---

## Troubleshooting

### WASM Module Not Found

```
Error: WASM module not found. Please run: npm run build:wasm
```

**Solution:**

```bash
npm run build:wasm
```

### WASM Initialization Failed

```
⚠️ Failed to initialize WASM: ...
```

**Possible causes:**

1. WASM not supported in browser → Falls back to Web Workers automatically
2. WASM file not in dist/wasm folder → Run `npm run build:wasm`
3. CORS issues → Ensure WASM files are served with correct headers

### Performance Not Improved

**Check console:**

- Look for "🚀 Very large file detected..."
- If you see "Large file detected..." instead, file is too small for WASM
- WASM only activates for files ≥10MB or ≥50k rows

**Force WASM for smaller files:**
Edit `PerformanceConfig.ts`:

```typescript
useWasmAboveSize: 1 * 1024 * 1024,  // 1MB instead of 10MB
useWasmAboveRows: 5000,              // 5k rows instead of 50k
```

---

## Development

### Build Debug WASM

```bash
npm run build:wasm:debug
```

Creates `dist/wasm/csvParser.debug.wasm` with:

- Source maps
- Debugging symbols
- Unoptimized code for easier debugging

### Modify AssemblyScript Code

Edit `assembly/csvParser.ts` and rebuild:

```bash
npm run build:wasm
```

### Test WASM Directly

```typescript
import { getWasmLoader } from '@mindfiredigital/pivothead';

const loader = getWasmLoader();
await loader.load();

const csvData = 'name,age\nJohn,30\nJane,25';
const result = loader.parseCSVChunk(csvData);

console.log(`Rows: ${result.rowCount}, Cols: ${result.colCount}`);
```

---

## Architecture

```
┌─────────────────────────────────────┐
│  ConnectService                     │
│  ├─ Check file size/row count       │
│  └─ Route to processor:             │
└───────────┬───────────────────────── ┘
            │
            ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│  WASM  │    │ Workers  │
│ (≥10MB)│    │ (≥5MB)   │
└────────┘    └──────────┘
    │               │
    │               │
    ▼               ▼
┌─────────────────────────────────────┐
│  WasmCSVProcessor                   │
│  ├─ Load csvParser.wasm             │
│  ├─ Parse CSV with WASM functions   │
│  ├─ Type detection                  │
│  └─ Return structured data          │
└─────────────────────────────────────┘
```

---

## Future Enhancements

Planned improvements for WASM integration:

- [ ] Full CSV parsing in WASM (currently hybrid JS/WASM)
- [ ] Streaming WASM parser for huge files (>100MB)
- [ ] WASM-based filtering and aggregation
- [ ] Multi-threaded WASM with Web Workers
- [ ] SIMD optimizations for parallel processing

---

## Credits

Built with:

- **AssemblyScript** - TypeScript-to-WebAssembly compiler
- **@assemblyscript/loader** - WASM module loader

---

## License

Same as PivotHead core package (MIT)

---

## Support

For issues or questions:

- GitHub: https://github.com/mindfiredigital/PivotHead/issues
- Documentation: https://pivothead.dev

---

**Happy high-performance data processing! 🚀**
