---
sidebar_position: 1
title: Server-Side
description: Complete guide for using PivotHead in Node.js server environments
---

# Server-Side Implementation

Use PivotHead's powerful WASM CSV parser in your Node.js server applications with the same core package used in the browser.

## Overview

PivotHead follows a **library approach** - you get the core WASM functionality and use it however you want. No framework, no opinionated architecture, just high-performance CSV parsing in Node.js.

### Key Benefits

**Same Package** - Use `@mindfiredigital/pivothead` for both browser and Node.js
**WASM Performance** - Near-native C++ speed for CSV parsing
**Memory Efficient** - Stream large files without loading everything into memory
**Framework Agnostic** - Works with Express, Fastify, Koa, or any Node.js setup
**Production Ready** - Tested with 800MB+ files and 10M+ rows

---

## Installation

Install the core package:

```bash
npm install @mindfiredigital/pivothead
```

That's it! No additional server-specific packages needed.

---

## What's Exposed

The package exports the following for server-side use:

### Main Exports

```javascript
const {
  WasmLoader, // Main class to load and use WASM
  getWasmLoader, // Helper function (same as WasmLoader.getInstance())
} = require('@mindfiredigital/pivothead');
```

### Available Methods

| Method                                 | Description                            | Returns         |
| -------------------------------------- | -------------------------------------- | --------------- |
| `WasmLoader.getInstance()`             | Get singleton WASM instance            | `WasmModule`    |
| `wasm.load()`                          | Initialize WASM (call once at startup) | `Promise<void>` |
| `wasm.parseCSVChunk(csvData, options)` | Parse CSV string                       | `WasmCSVResult` |
| `wasm.getVersion()`                    | Get WASM version                       | `string`        |
| `wasm.unload()`                        | Clean up resources                     | `void`          |

### Configuration Options

```typescript
interface ParseOptions {
  delimiter?: string; // Default: ','
  hasHeader?: boolean; // Default: true
  trimValues?: boolean; // Default: true
}
```

### Result Object

```typescript
interface WasmCSVResult {
  rowCount: number; // Number of rows parsed
  colCount: number; // Number of columns
  errorCode: number; // 0 = success, non-zero = error
  errorMessage: string; // Error details if errorCode !== 0
  estimatedMemory?: number; // Memory used in bytes
  parseTime?: number; // Parse time in milliseconds
}
```

---

## Quick Start

### Step 1: Initialize WASM

Initialize WASM once when your application starts:

```javascript
const { WasmLoader } = require('@mindfiredigital/pivothead');

// Get singleton instance
const wasm = WasmLoader.getInstance();

// Load WASM module (do this once at startup)
async function initialize() {
  await wasm.load();
  console.log('✓ WASM loaded, version:', wasm.getVersion());
}

initialize();
```

### Step 2: Parse CSV Data

```javascript
const fs = require('fs');

// Read CSV file
const csvData = fs.readFileSync('data.csv', 'utf-8');

// Parse with WASM
const result = wasm.parseCSVChunk(csvData, {
  delimiter: ',',
  hasHeader: true,
  trimValues: true,
});

// Check result
if (result.errorCode === 0) {
  console.log(`✓ Parsed ${result.rowCount} rows, ${result.colCount} columns`);
} else {
  console.error(`✗ Error: ${result.errorMessage}`);
}
```

---

## Common Use Cases

### 1. REST API with Express

```javascript
const express = require('express');
const { WasmLoader } = require('@mindfiredigital/pivothead');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Initialize WASM
const wasm = WasmLoader.getInstance();
let wasmReady = false;

wasm.load().then(() => {
  wasmReady = true;
  console.log('✓ WASM ready');
});

// Parse endpoint
app.post('/api/parse', (req, res) => {
  if (!wasmReady) {
    return res.status(503).json({ error: 'Service initializing' });
  }

  const result = wasm.parseCSVChunk(req.body.csv, {
    delimiter: req.body.delimiter || ',',
    hasHeader: true,
  });

  if (result.errorCode !== 0) {
    return res.status(400).json({ error: result.errorMessage });
  }

  res.json({
    success: true,
    rows: result.rowCount,
    columns: result.colCount,
    parseTime: result.parseTime,
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 2. File Upload Handler

```javascript
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { WasmLoader } = require('@mindfiredigital/pivothead');

const upload = multer({ dest: 'uploads/' });
const wasm = WasmLoader.getInstance();

wasm.load().then(() => console.log('WASM ready'));

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Read uploaded file
    const csvData = fs.readFileSync(req.file.path, 'utf-8');

    // Parse
    const result = wasm.parseCSVChunk(csvData, {
      delimiter: ',',
      hasHeader: true,
    });

    // Clean up
    fs.unlinkSync(req.file.path);

    if (result.errorCode !== 0) {
      return res.status(400).json({ error: result.errorMessage });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      rows: result.rowCount,
      columns: result.colCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Processing Large Files (Streaming)

For files larger than available RAM, use streaming:

```javascript
const fs = require('fs');
const readline = require('readline');
const { WasmLoader } = require('@mindfiredigital/pivothead');

async function processLargeFile(filePath) {
  const wasm = WasmLoader.getInstance();
  await wasm.load();

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let header = '';
  let chunk = [];
  let totalRows = 0;
  const CHUNK_SIZE = 10000; // Process 10k rows at a time

  for await (const line of rl) {
    if (!line.trim()) continue;

    // First line is header
    if (!header) {
      header = line;
      continue;
    }

    chunk.push(line);

    // Process chunk when size reached
    if (chunk.length >= CHUNK_SIZE) {
      const csvChunk = header + '\n' + chunk.join('\n');

      const result = wasm.parseCSVChunk(csvChunk, {
        delimiter: ',',
        hasHeader: true,
      });

      if (result.errorCode === 0) {
        totalRows += result.rowCount;
        console.log(`Processed ${totalRows} rows...`);
      }

      chunk = []; // Clear memory
    }
  }

  // Process remaining chunk
  if (chunk.length > 0) {
    const csvChunk = header + '\n' + chunk.join('\n');
    const result = wasm.parseCSVChunk(csvChunk, { delimiter: ',' });
    totalRows += result.rowCount;
  }

  console.log(`✓ Total: ${totalRows} rows processed`);
  return totalRows;
}

// Usage
processLargeFile('./large-data.csv');
```

### 4. Background Job Processing

```javascript
const Queue = require('bull');
const { WasmLoader } = require('@mindfiredigital/pivothead');
const fs = require('fs');

const csvQueue = new Queue('csv-processing');
const wasm = WasmLoader.getInstance();

wasm.load().then(() => console.log('Worker ready'));

// Process jobs
csvQueue.process(async job => {
  const { filePath } = job.data;

  // Read and parse
  const csvData = fs.readFileSync(filePath, 'utf-8');
  const result = wasm.parseCSVChunk(csvData, { delimiter: ',' });

  if (result.errorCode !== 0) {
    throw new Error(result.errorMessage);
  }

  return {
    success: true,
    rows: result.rowCount,
    columns: result.colCount,
  };
});

// Add job to queue
csvQueue.add({ filePath: '/uploads/data.csv' });
```

### 5. CLI Tool

```javascript
#!/usr/bin/env node
const fs = require('fs');
const { WasmLoader } = require('@mindfiredigital/pivothead');

async function parseFile(filePath) {
  const wasm = WasmLoader.getInstance();
  await wasm.load();

  const csvData = fs.readFileSync(filePath, 'utf-8');
  const result = wasm.parseCSVChunk(csvData, { delimiter: ',' });

  if (result.errorCode !== 0) {
    console.error('Error:', result.errorMessage);
    process.exit(1);
  }

  console.log('✓ Parse successful');
  console.log(`  Rows: ${result.rowCount}`);
  console.log(`  Columns: ${result.colCount}`);
  console.log(`  Time: ${result.parseTime}ms`);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node parse.js <file.csv>');
  process.exit(1);
}

parseFile(filePath);
```

---

## Performance Tips

### 1. Initialize Once

```javascript
//  Good - Initialize at startup
const wasm = WasmLoader.getInstance();
await wasm.load(); // Call once

//  Bad - Don't initialize on every request
app.post('/parse', async (req, res) => {
  await wasm.load(); //  Slow!
});
```

### 2. Use Streaming for Large Files

```javascript
//  Good - Stream large files
processLargeFile('800mb-file.csv'); // Uses streaming

//  Bad - Load entire file into memory
const data = fs.readFileSync('800mb-file.csv', 'utf-8'); //  May crash
```

### 3. Set Memory Limits

```json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 server.js"
  }
}
```

### 4. Clean Up Resources

```javascript
// Clean up uploaded files
fs.unlinkSync(req.file.path);

// Unload WASM on shutdown
process.on('SIGTERM', () => {
  wasm.unload();
  process.exit(0);
});
```

---

## Security Best Practices

### Validate File Size

```javascript
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max
  },
});
```

### Sanitize Delimiters

### Handle Errors Gracefully

```javascript
function sanitizeDelimiter(delimiter) {
  const allowed = [',', ';', '\t', '|'];
  return allowed.includes(delimiter) ? delimiter : ',';
}
```

```javascript
const result = wasm.parseCSVChunk(csvData, { delimiter: ',' });

if (result.errorCode !== 0) {
  console.error('Parse error:', result.errorMessage);
  // Handle error appropriately
}
```

---

## Error Codes

| Code  | Meaning           | Description                          |
| ----- | ----------------- | ------------------------------------ |
| `0`   | Success           | Parsing completed successfully       |
| `101` | Invalid Delimiter | Delimiter is invalid or inconsistent |
| `102` | Malformed CSV     | CSV structure is invalid             |
| `103` | Memory Error      | Out of memory                        |
| `104` | Invalid Input     | Input data is null or invalid        |

---

## What You Can Build

With PivotHead's server-side implementation, you can build:

- **REST APIs** - CSV processing endpoints
- **File Upload Services** - Handle large file uploads
- **Background Jobs** - Async CSV processing with queues
- **CLI Tools** - Command-line CSV utilities
- **Microservices** - Dedicated CSV processing services
- **Serverless Functions** - AWS Lambda, Google Cloud Functions
- **Data Pipelines** - ETL and data transformation
- **GraphQL APIs** - CSV data in GraphQL resolvers

---

## Additional Resources

- **[Core Web Component Tutorial](../tutorials/core-webcomponent/core-webcomponent-sample-project)** - Browser usage
- **[React Tutorial](../tutorials/react/react-sample-project)** - React integration
- **[Vue Tutorial](../tutorials/vue/vue-sample-project)** - Vue integration
- **[GitHub Repository](https://github.com/mindfiredigital/PivotHead)** - Source code and examples
- **[GitHub Issues](https://github.com/mindfiredigital/PivotHead/issues)** - Report bugs or ask questions

---

## Summary

**Server-side PivotHead is simple:**

1. Install: `npm install @mindfiredigital/pivothead`
2. Initialize: `await wasm.load()` (once at startup)
3. Parse: `wasm.parseCSVChunk(csvData, option)`
4. Use anywhere: REST APIs, background jobs, CLI tools, etc.

**You get:**

- High-performance WASM CSV parsing
- Same package for browser and Node.js
- Freedom to build however you want
- No framework lock-in

Start building your CSV processing solution today!
