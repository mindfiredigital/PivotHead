/**
 * Express.js API Server with Swagger Documentation
 *
 * Interactive API documentation and testing interface for PivotHead CSV parser
 * Access Swagger UI at: http://localhost:3000/api-docs
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
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

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PivotHead CSV Parser API',
      version: '1.5.0',
      description:
        'High-performance WebAssembly-powered CSV parsing API for Node.js',
      contact: {
        name: 'Mindfiredigital',
        url: 'https://github.com/mindfiredigital/PivotHead',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status',
      },
      {
        name: 'CSV Operations',
        description: 'CSV parsing and analysis operations',
      },
      {
        name: 'Utilities',
        description: 'Utility functions and helpers',
      },
    ],
    components: {
      schemas: {
        CSVParseRequest: {
          type: 'object',
          required: ['csv'],
          properties: {
            csv: {
              type: 'string',
              description: 'CSV data to parse',
              example: 'Name,Age,City\nJohn,30,New York\nJane,25,Los Angeles',
            },
            delimiter: {
              type: 'string',
              description: 'Column delimiter',
              default: ',',
              example: ',',
            },
            hasHeader: {
              type: 'boolean',
              description: 'First row is header',
              default: true,
              example: true,
            },
            trimValues: {
              type: 'boolean',
              description: 'Trim whitespace from values',
              default: true,
              example: true,
            },
          },
        },
        CSVParseResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                rowCount: {
                  type: 'integer',
                  description: 'Number of rows parsed',
                  example: 2,
                },
                colCount: {
                  type: 'integer',
                  description: 'Number of columns detected',
                  example: 3,
                },
                estimatedMemory: {
                  type: 'integer',
                  description: 'Estimated memory usage in bytes',
                  example: 1024,
                },
                parseTime: {
                  type: 'integer',
                  description: 'Parse time in milliseconds',
                  example: 12,
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                wasmVersion: {
                  type: 'string',
                  example: '1.0.0',
                },
                options: {
                  type: 'object',
                  properties: {
                    delimiter: { type: 'string' },
                    hasHeader: { type: 'boolean' },
                    trimValues: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
        AnalysisRequest: {
          type: 'object',
          required: ['csv'],
          properties: {
            csv: {
              type: 'string',
              description: 'CSV data to analyze',
              example: 'Name,Age\nJohn,30\nJane,25',
            },
          },
        },
        AnalysisResponse: {
          type: 'object',
          properties: {
            analysis: {
              type: 'object',
              properties: {
                totalLines: { type: 'integer', example: 3 },
                detectedDelimiter: { type: 'string', example: ',' },
                estimatedColumns: { type: 'integer', example: 2 },
                estimatedRows: { type: 'integer', example: 2 },
                sampleParsed: { type: 'integer', example: 2 },
                fileSize: { type: 'integer', example: 25 },
                estimatedMemory: { type: 'integer', example: 1024 },
              },
            },
          },
        },
        BenchmarkRequest: {
          type: 'object',
          required: ['csv'],
          properties: {
            csv: {
              type: 'string',
              description: 'CSV data to benchmark',
              example: 'A,B,C\n1,2,3\n4,5,6',
            },
          },
        },
        TypeDetectionRequest: {
          type: 'object',
          required: ['values'],
          properties: {
            values: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of values to detect types for',
              example: ['John', '30', 'true', ''],
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              example: 'CSV data is required',
            },
          },
        },
      },
    },
  },
  apis: ['./express-api-swagger.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PivotHead API Documentation',
  })
);

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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check API and WASM module status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 wasmReady:
 *                   type: boolean
 *                   example: true
 *                 wasmVersion:
 *                   type: string
 *                   example: 1.0.0
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @swagger
 * /api/parse:
 *   post:
 *     summary: Parse CSV data
 *     description: Parse CSV data using WebAssembly for high performance
 *     tags: [CSV Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CSVParseRequest'
 *           examples:
 *             simple:
 *               summary: Simple CSV
 *               value:
 *                 csv: "Name,Age,City\nJohn,30,New York\nJane,25,Los Angeles"
 *             withOptions:
 *               summary: With custom options
 *               value:
 *                 csv: "Name;Age;City\nJohn;30;New York"
 *                 delimiter: ";"
 *                 hasHeader: true
 *                 trimValues: true
 *     responses:
 *       200:
 *         description: CSV parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CSVParseResponse'
 *       400:
 *         description: Invalid CSV data or parse error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: WASM module not ready
 */
app.post('/api/parse', ensureWasmReady, (req, res) => {
  try {
    const startTime = Date.now();

    let csvData;
    if (typeof req.body === 'string') {
      csvData = req.body;
    } else if (req.body.csv) {
      csvData = req.body.csv;
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message:
          'CSV data is required. Send as text/csv or JSON with "csv" field.',
      });
    }

    const options = {
      delimiter: req.body.delimiter || ',',
      hasHeader: req.body.hasHeader !== false,
      trimValues: req.body.trimValues !== false,
    };

    const result = wasm.parseCSVChunk(csvData, options);
    const parseTime = Date.now() - startTime;

    if (result.errorCode !== 0) {
      return res.status(400).json({
        error: 'CSV Parse Error',
        message: result.errorMessage,
        errorCode: result.errorCode,
      });
    }

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
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Analyze CSV structure
 *     description: Analyze CSV file structure and detect delimiter
 *     tags: [CSV Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalysisRequest'
 *     responses:
 *       200:
 *         description: Analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResponse'
 *       400:
 *         description: Invalid data
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

    const lines = csvData.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || '';

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
        estimatedRows: lines.length - 1,
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
 * @swagger
 * /api/benchmark:
 *   post:
 *     summary: Benchmark CSV parsing
 *     description: Run performance benchmark on CSV data
 *     tags: [CSV Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BenchmarkRequest'
 *     responses:
 *       200:
 *         description: Benchmark completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 benchmark:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: number
 *                       example: 1.23
 *                     throughput:
 *                       type: string
 *                       example: "1000.50 bytes/ms"
 *                     dataSize:
 *                       type: integer
 *                       example: 1234
 *                     wasmVersion:
 *                       type: string
 *                       example: "1.0.0"
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
 * @swagger
 * /api/detect-types:
 *   post:
 *     summary: Detect field types
 *     description: Detect data types for given values (string, number, boolean, null)
 *     tags: [Utilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypeDetectionRequest'
 *     responses:
 *       200:
 *         description: Types detected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [string, number, boolean, null]
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

    res.json({ results });
  } catch (error) {
    console.error('Error in /api/detect-types:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get version information
 *     description: Get WASM and package version information
 *     tags: [Utilities]
 *     responses:
 *       200:
 *         description: Version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wasmVersion:
 *                   type: string
 *                   example: "1.0.0"
 *                 packageVersion:
 *                   type: string
 *                   example: "1.5.0"
 */
app.get('/api/version', ensureWasmReady, (req, res) => {
  res.json({
    wasmVersion: wasm.getVersion(),
    packageVersion: require('../../packages/core/package.json').version,
  });
});

// Root redirect to Swagger docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
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
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('PivotHead CSV Parser API Server with Swagger');
  console.log('='.repeat(60));
  console.log(`Server:        http://localhost:${PORT}`);
  console.log(`Documentation: http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('Quick Test:');
  console.log(`  curl http://localhost:${PORT}/health`);
  console.log('');
  console.log('Interactive Testing:');
  console.log(`  Open http://localhost:${PORT}/api-docs in your browser`);
  console.log('  Click "Try it out" on any endpoint to test it');
  console.log('');
  console.log('Press Ctrl+C to stop');
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
