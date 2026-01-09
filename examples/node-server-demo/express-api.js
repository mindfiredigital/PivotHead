/**
 * Express.js API Server for CSV Processing
 *
 * This example demonstrates how to create a REST API for CSV parsing
 * using PivotHead's WASM-powered parser in Express.js
 */

const express = require('express');
const {
  WasmLoader,
} = require('../../packages/core/dist/pivothead-core.umd.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ type: 'text/csv', limit: '50mb' }));

// WASM initialization
let wasmReady = false;
const wasm = WasmLoader.getInstance();

// Initialize WASM on startup
console.log('Initializing WASM module...');
wasm
  .load()
  .then(() => {
    wasmReady = true;
    console.log(`✓ WASM module loaded successfully (v${wasm.getVersion()})`);
  })
  .catch(err => {
    console.error('✗ Failed to load WASM module:', err);
    process.exit(1);
  });

// Middleware to check WASM readiness
const ensureWasmReady = (req, res, next) => {
  if (!wasmReady) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'WASM module is still loading. Please try again in a moment.',
    });
  }
  next();
};

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    wasmReady,
    wasmVersion: wasmReady ? wasm.getVersion() : null,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Parse CSV data
 * POST /api/parse
 * Body: { csv: "...", delimiter?: ",", hasHeader?: true, trimValues?: true }
 */
app.post('/api/parse', ensureWasmReady, (req, res) => {
  try {
    const startTime = Date.now();

    // Extract CSV data from request
    let csvData;
    if (typeof req.body === 'string') {
      csvData = req.body; // Raw text/csv
    } else if (req.body.csv) {
      csvData = req.body.csv; // JSON with csv field
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message:
          'CSV data is required. Send as text/csv or JSON with "csv" field.',
      });
    }

    // Parse options
    const options = {
      delimiter: req.body.delimiter || ',',
      hasHeader: req.body.hasHeader !== false,
      trimValues: req.body.trimValues !== false,
    };

    // Parse CSV using WASM
    const result = wasm.parseCSVChunk(csvData, options);
    const parseTime = Date.now() - startTime;

    // Check for parsing errors
    if (result.errorCode !== 0) {
      return res.status(400).json({
        error: 'CSV Parse Error',
        message: result.errorMessage,
        errorCode: result.errorCode,
      });
    }

    // Return successful result
    res.json({
      success: true,
      data: {
        rowCount: result.rowCount,
        colCount: result.colCount,
        estimatedMemory: wasm.estimateMemory(result.rowCount, result.colCount),
        parseTime: parseTime,
      },
      meta: {
        wasmVersion: wasm.getVersion(),
        options: options,
      },
    });
  } catch (error) {
    console.error('Error in /api/parse:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * Analyze CSV structure (without full parsing)
 * POST /api/analyze
 * Body: { csv: "..." }
 */
app.post('/api/analyze', ensureWasmReady, (req, res) => {
  try {
    const csvData = req.body.csv || req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'CSV data is required as string',
      });
    }

    // Quick analysis
    const lines = csvData.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || '';
    const sampleLine = lines[1] || '';

    // Detect delimiter
    const delimiters = [',', ';', '\t', '|'];
    const detectedDelimiter = delimiters.reduce((best, delim) => {
      const count = firstLine.split(delim).length;
      return count > firstLine.split(best).length ? delim : best;
    }, ',');

    // Parse a sample
    const result = wasm.parseCSVChunk(lines.slice(0, 10).join('\n'), {
      delimiter: detectedDelimiter,
      hasHeader: true,
    });

    res.json({
      analysis: {
        totalLines: lines.length,
        detectedDelimiter: detectedDelimiter,
        estimatedColumns: result.colCount,
        estimatedRows: lines.length - 1, // excluding header
        sampleParsed: result.rowCount,
        fileSize: csvData.length,
        estimatedMemory: wasm.estimateMemory(lines.length - 1, result.colCount),
      },
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * Benchmark CSV parsing performance
 * POST /api/benchmark
 * Body: { csv: "..." }
 */
app.post('/api/benchmark', ensureWasmReady, (req, res) => {
  try {
    const csvData = req.body.csv || req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'CSV data is required',
      });
    }

    const benchmarkTime = wasm.benchmark(csvData);

    res.json({
      benchmark: {
        time: benchmarkTime,
        throughput: (csvData.length / benchmarkTime).toFixed(2) + ' bytes/ms',
        dataSize: csvData.length,
        wasmVersion: wasm.getVersion(),
      },
    });
  } catch (error) {
    console.error('Error in /api/benchmark:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * Detect field types in CSV
 * POST /api/detect-types
 * Body: { values: ["value1", "value2", ...] }
 */
app.post('/api/detect-types', ensureWasmReady, (req, res) => {
  try {
    const values = req.body.values;

    if (!Array.isArray(values)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'values array is required',
      });
    }

    const typeNames = ['string', 'number', 'boolean', 'null'];
    const results = values.map(value => ({
      value: value,
      type: typeNames[wasm.detectFieldType(String(value))],
    }));

    res.json({
      results,
    });
  } catch (error) {
    console.error('Error in /api/detect-types:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * Get WASM version info
 */
app.get('/api/version', ensureWasmReady, (req, res) => {
  res.json({
    wasmVersion: wasm.getVersion(),
    packageVersion: require('../../packages/core/package.json').version,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET  /health',
      'GET  /api/version',
      'POST /api/parse',
      'POST /api/analyze',
      'POST /api/benchmark',
      'POST /api/detect-types',
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('PivotHead CSV Parser API Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/api/version`);
  console.log(`  POST http://localhost:${PORT}/api/parse`);
  console.log(`  POST http://localhost:${PORT}/api/analyze`);
  console.log(`  POST http://localhost:${PORT}/api/benchmark`);
  console.log(`  POST http://localhost:${PORT}/api/detect-types`);
  console.log('');
  console.log('Example curl commands:');
  console.log(`  curl http://localhost:${PORT}/health`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/parse \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"csv":"Name,Age\\nJohn,30\\nJane,25"}'`);
  console.log('='.repeat(60));
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  wasm.unload();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  wasm.unload();
  process.exit(0);
});
