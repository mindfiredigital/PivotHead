# PivotHead Node.js Server-Side Demo

This directory contains examples demonstrating how to use PivotHead's WASM-powered CSV parser in Node.js server environments.

## 🚀 Quick Start - Upload Your 800MB CSV

**Want to test with your large CSV file right now?**

👉 **[START HERE - Step-by-Step Guide](./START_HERE.md)** 👈

```bash
npm run start:upload
# Open: http://localhost:3000/upload.html
# Drag your 800MB file and see results in 30-60 seconds!
```

---

## What's Included

- **basic-test.js** - Simple Node.js script demonstrating WASM CSV parsing
- **express-api.js** - Full-featured REST API server for CSV processing
- **express-api-swagger.js** - REST API with interactive Swagger/OpenAPI documentation
- **sample-data.csv** - Test data file with 20 rows

## Prerequisites

- Node.js 12 or higher
- The core package must be built first

## Setup

1. **Build the core package** (from repository root):

   ```bash
   cd packages/core
   pnpm install
   pnpm build
   cd ../../examples/node-server-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Running the Examples

### 1. Basic Test

Run the basic Node.js test to verify WASM functionality:

```bash
npm test
# or
node basic-test.js
```

**What it does:**

- Loads the WASM module
- Parses a CSV file
- Tests all WASM functions (parsing, field extraction, type detection, etc.)
- Displays performance metrics

**Expected output:**

```
============================================================
PivotHead Node.js WASM CSV Parser - Basic Test
============================================================

Step 1: Getting WasmLoader instance...
✓ WasmLoader instance created

Step 2: Loading WASM module...
✓ WASM module loaded in 45ms
✓ WASM Version: 1.0.0

...

============================================================
TEST COMPLETED SUCCESSFULLY
============================================================
```

### 2. Express API Server with Swagger UI (Recommended)

Start the REST API server with interactive documentation:

```bash
npm start
# or
node express-api-swagger.js
```

The server will start on `http://localhost:3000`

**Access Interactive API Documentation:**
Open your browser and navigate to: **http://localhost:3000/api-docs**

This provides a complete Swagger UI where you can:

- View all available endpoints
- See request/response schemas
- Test endpoints directly in the browser
- Try different examples and parameters

### 2b. Express API Server (Basic, No Swagger)

If you prefer the basic server without Swagger:

```bash
npm run start:basic
# or
node express-api.js
```

#### Available Endpoints

**Health Check**

```bash
curl http://localhost:3000/health
```

**Parse CSV**

```bash
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"csv":"Name,Age,City\nJohn,30,NYC\nJane,25,LA"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "rowCount": 2,
    "colCount": 3,
    "estimatedMemory": 1024,
    "parseTime": 12
  },
  "meta": {
    "wasmVersion": "1.0.0",
    "options": {
      "delimiter": ",",
      "hasHeader": true,
      "trimValues": true
    }
  }
}
```

**Analyze CSV Structure**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d @sample-data.csv.json
```

**Benchmark Performance**

```bash
curl -X POST http://localhost:3000/api/benchmark \
  -H "Content-Type: application/json" \
  -d '{"csv":"Name,Age\nJohn,30\nJane,25"}'
```

**Detect Field Types**

```bash
curl -X POST http://localhost:3000/api/detect-types \
  -H "Content-Type: application/json" \
  -d '{"values":["John","30","true",""]}'
```

Response:

```json
{
  "results": [
    { "value": "John", "type": "string" },
    { "value": "30", "type": "number" },
    { "value": "true", "type": "boolean" },
    { "value": "", "type": "null" }
  ]
}
```

**Get Version**

```bash
curl http://localhost:3000/api/version
```

### 3. Interactive Testing with Swagger UI

The easiest way to test the API is through the Swagger UI interface:

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Open Swagger UI**:
   Navigate to http://localhost:3000/api-docs in your browser

3. **Test an endpoint**:
   - Click on any endpoint (e.g., `POST /api/parse`)
   - Click "Try it out"
   - Modify the request body (or use the example provided)
   - Click "Execute"
   - View the response below

**Example: Testing CSV Parse**

In the Swagger UI:

1. Expand `POST /api/parse`
2. Click "Try it out"
3. Use this example request:
   ```json
   {
     "csv": "Name,Age,Department\nJohn,30,Engineering\nJane,25,Marketing",
     "delimiter": ",",
     "hasHeader": true,
     "trimValues": true
   }
   ```
4. Click "Execute"
5. See the parsed result with row/column counts

**Available Tags:**

- **Health** - System status endpoints
- **CSV Operations** - Parse, analyze, benchmark CSV data
- **Utilities** - Type detection, version info

### 4. Development Mode with Auto-Reload

Use nodemon for automatic reloading during development:

```bash
npm run dev
```

## Testing with Sample Data

Parse the included sample CSV file:

```bash
# Using the basic test (automatically uses sample-data.csv)
node basic-test.js

# Using the API server
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data.csv
```

## Using in Your Own Project

After publishing the package to npm, users can install and use it like this:

```bash
npm install @mindfiredigital/pivothead
```

```javascript
const { WasmLoader } = require('@mindfiredigital/pivothead');

async function parseCSV(csvData) {
  const wasm = WasmLoader.getInstance();
  await wasm.load();

  const result = wasm.parseCSVChunk(csvData, {
    delimiter: ',',
    hasHeader: true,
    trimValues: true,
  });

  console.log(`Parsed ${result.rowCount} rows`);
  return result;
}
```

## Performance Notes

The WASM parser provides near-native performance:

- **Load time**: ~50ms (one-time initialization)
- **Parse speed**: ~100-500 MB/s depending on data complexity
- **Memory efficient**: Processes data in chunks

## Troubleshooting

### WASM module not found

If you get "WASM file not found" errors:

1. Make sure you've built the core package:

   ```bash
   cd ../../packages/core
   pnpm build
   ```

2. Check that WASM files exist:
   ```bash
   ls ../../packages/core/dist/wasm/csvParser.wasm
   ```

### Port already in use

If port 3000 is already in use, set a different port:

```bash
PORT=3001 npm start
```

### Node.js version

Ensure you're using Node.js 12 or higher:

```bash
node --version
```

## API Response Examples

### Successful Parse

```json
{
  "success": true,
  "data": {
    "rowCount": 20,
    "colCount": 6,
    "estimatedMemory": 2048,
    "parseTime": 8
  }
}
```

### Parse Error

```json
{
  "error": "CSV Parse Error",
  "message": "Invalid delimiter at line 5",
  "errorCode": 101
}
```

## Learn More

- Main README: [../../README.md](../../README.md)
- Server Usage Guide: [../../SERVER_USAGE.md](../../SERVER_USAGE.md)
- Core Package: [../../packages/core](../../packages/core)

## License

MIT
