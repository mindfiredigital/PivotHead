/**
 * Express.js API Server with File Upload Support
 *
 * This version supports uploading large CSV files (like 800MB+)
 * with streaming processing and progress tracking.
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const {
  WasmLoader,
} = require('../../packages/core/dist/pivothead-core.umd.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max
  },
});

// WASM initialization
let wasmReady = false;
const wasm = WasmLoader.getInstance();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PivotHead CSV Parser API with File Upload',
      version: '1.5.0',
      description:
        'High-performance CSV parsing with support for large file uploads (800MB+)',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    tags: [
      { name: 'Health', description: 'Health check' },
      { name: 'File Upload', description: 'Upload and process CSV files' },
      { name: 'CSV Operations', description: 'Parse CSV data' },
    ],
  },
  apis: ['./express-api-upload.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize WASM
console.log('Initializing WASM module...');
wasm
  .load()
  .then(() => {
    wasmReady = true;
    console.log(`✓ WASM module loaded (v${wasm.getVersion()})`);
  })
  .catch(err => {
    console.error('✗ Failed to load WASM:', err);
    process.exit(1);
  });

const ensureWasmReady = (req, res, next) => {
  if (!wasmReady) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'WASM module is still loading',
    });
  }
  next();
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server status
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
 * /api/upload:
 *   post:
 *     summary: Upload and parse CSV file
 *     description: Upload a CSV file (up to 2GB) and get parsing results with streaming
 *     tags: [File Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to upload
 *               delimiter:
 *                 type: string
 *                 default: ","
 *                 description: Column delimiter
 *               chunkSize:
 *                 type: integer
 *                 default: 10000
 *                 description: Number of rows to process per chunk
 *     responses:
 *       200:
 *         description: File processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 fileInfo:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     sizeFormatted:
 *                       type: string
 *                 parsing:
 *                   type: object
 *                   properties:
 *                     totalRows:
 *                       type: integer
 *                     totalColumns:
 *                       type: integer
 *                     chunksProcessed:
 *                       type: integer
 *                     totalTime:
 *                       type: integer
 *                     throughput:
 *                       type: string
 *                 sample:
 *                   type: object
 *                   properties:
 *                     firstRows:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: No file uploaded or invalid file
 */
app.post(
  '/api/upload',
  ensureWasmReady,
  upload.single('file'),
  async (req, res) => {
    const startTime = Date.now();

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No file uploaded. Please upload a CSV file.',
        });
      }

      const filePath = req.file.path;
      const filename = req.file.originalname;
      const fileSize = req.file.size;
      const delimiter = req.body.delimiter || ',';
      const chunkSize = parseInt(req.body.chunkSize) || 10000;

      console.log(
        `Processing file: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`
      );

      // Process file with streaming
      const result = await processLargeCSV(filePath, delimiter, chunkSize);

      // Calculate stats
      const totalTime = Date.now() - startTime;
      const throughput = (fileSize / totalTime).toFixed(2);

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Debug logging
      console.log('Result structure:', {
        hasHeader: !!result.header,
        headerLength: result.header ? result.header.length : 0,
        hasDataRows: !!result.dataRows,
        dataRowsLength: result.dataRows ? result.dataRows.length : 0,
        hasRawSample: !!result.rawSample,
        rawSampleLength: result.rawSample ? result.rawSample.length : 0,
      });

      const responseData = {
        success: true,
        fileInfo: {
          filename: filename,
          size: fileSize,
          sizeFormatted: formatBytes(fileSize),
        },
        parsing: {
          totalRows: result.totalRows,
          totalColumns: result.columns,
          chunksProcessed: result.chunksProcessed,
          totalTime: totalTime,
          throughput: `${throughput} bytes/ms (${(throughput / 1024).toFixed(2)} KB/ms)`,
        },
        sample: {
          firstRows: result.sampleRows,
        },
        data: {
          header: result.header || [],
          rows: result.dataRows || [],
          rawSample: result.rawSample || [],
          pivotStats: result.pivotStats || [],
          displayedRows: result.dataRows ? result.dataRows.length : 0,
          isPartialData:
            result.totalRows > (result.dataRows ? result.dataRows.length : 0),
        },
        message: `Successfully processed ${result.totalRows.toLocaleString()} rows in ${(totalTime / 1000).toFixed(2)}s${result.totalRows > 10000 ? ' (showing first 10,000 rows in table)' : ''}`,
      };

      console.log(
        'Sending response with data.header:',
        responseData.data.header
      );
      res.json(responseData);
    } catch (error) {
      console.error('Error processing upload:', error);

      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }
);

/**
 * Process large CSV file with streaming
 */
async function processLargeCSV(filePath, delimiter = ',', chunkSize = 10000) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let header = '';
    let chunk = [];
    let totalRows = 0;
    let columns = 0;
    let chunksProcessed = 0;
    let sampleRows = [];
    let dataRows = [];
    let rawSample = [];
    let isFirstLine = true;
    let columnStats = null; // Will store min, max, sum, count for numeric columns

    rl.on('line', line => {
      if (!line.trim()) return; // Skip empty lines

      if (isFirstLine) {
        header = line;
        isFirstLine = false;

        // Collect first few rows as sample
        if (sampleRows.length < 5) {
          sampleRows.push(line);
        }
        return;
      }

      chunk.push(line);

      // Collect sample rows for display
      if (sampleRows.length < 5) {
        sampleRows.push(line);
      }

      // Parse row data for statistics and limited storage
      const rowData = line.split(delimiter);

      // Only store first 10,000 rows for table display (memory optimization)
      if (dataRows.length < 10000) {
        dataRows.push(rowData);
        rawSample.push(line);
      }

      // Update column statistics for ALL rows (incremental, memory efficient)
      if (!columnStats) {
        columnStats = rowData.map(() => ({
          sum: 0,
          min: Infinity,
          max: -Infinity,
          count: 0,
          numericCount: 0,
        }));
      }

      rowData.forEach((value, idx) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() !== '') {
          columnStats[idx].sum += numValue;
          columnStats[idx].min = Math.min(columnStats[idx].min, numValue);
          columnStats[idx].max = Math.max(columnStats[idx].max, numValue);
          columnStats[idx].numericCount++;
        }
        columnStats[idx].count++;
      });

      // Process chunk when it reaches the specified size
      if (chunk.length >= chunkSize) {
        const csvChunk = header + '\n' + chunk.join('\n');

        try {
          const result = wasm.parseCSVChunk(csvChunk, {
            delimiter: delimiter,
            hasHeader: true,
            trimValues: true,
          });

          if (result.errorCode === 0) {
            totalRows += result.rowCount;
            columns = result.colCount;
            chunksProcessed++;

            // Log progress for large files
            if (chunksProcessed % 10 === 0) {
              console.log(`  Processed ${totalRows.toLocaleString()} rows...`);
            }
          }
        } catch (error) {
          console.error('Error parsing chunk:', error);
        }

        chunk = [];
      }
    });

    rl.on('close', () => {
      // Process remaining chunk
      if (chunk.length > 0) {
        const csvChunk = header + '\n' + chunk.join('\n');

        try {
          const result = wasm.parseCSVChunk(csvChunk, {
            delimiter: delimiter,
            hasHeader: true,
            trimValues: true,
          });

          if (result.errorCode === 0) {
            totalRows += result.rowCount;
            columns = result.colCount;
            chunksProcessed++;
          }
        } catch (error) {
          console.error('Error parsing final chunk:', error);
        }
      }

      console.log(
        `✓ Completed: ${totalRows.toLocaleString()} rows in ${chunksProcessed} chunks`
      );

      // Calculate averages for pivot statistics
      const pivotStats = columnStats
        ? columnStats.map((stat, idx) => ({
            columnIndex: idx,
            columnName: header.split(delimiter)[idx],
            count: stat.count,
            numericCount: stat.numericCount,
            sum: stat.numericCount > 0 ? stat.sum : null,
            avg: stat.numericCount > 0 ? stat.sum / stat.numericCount : null,
            min:
              stat.numericCount > 0 && stat.min !== Infinity ? stat.min : null,
            max:
              stat.numericCount > 0 && stat.max !== -Infinity ? stat.max : null,
            isNumeric: stat.numericCount > 0,
          }))
        : [];

      resolve({
        totalRows,
        columns,
        chunksProcessed,
        sampleRows,
        header: header.split(delimiter),
        dataRows: dataRows,
        rawSample: rawSample,
        pivotStats: pivotStats,
      });
    });

    rl.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * @swagger
 * /api/parse:
 *   post:
 *     summary: Parse CSV data from request body
 *     tags: [CSV Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               csv:
 *                 type: string
 *                 example: "Name,Age\nJohn,30\nJane,25"
 *     responses:
 *       200:
 *         description: CSV parsed
 */
app.post('/api/parse', ensureWasmReady, (req, res) => {
  try {
    const csvData = req.body.csv || req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'CSV data is required',
      });
    }

    const result = wasm.parseCSVChunk(csvData, {
      delimiter: req.body.delimiter || ',',
      hasHeader: req.body.hasHeader !== false,
      trimValues: req.body.trimValues !== false,
    });

    if (result.errorCode !== 0) {
      return res.status(400).json({
        error: 'Parse Error',
        message: result.errorMessage,
      });
    }

    res.json({
      success: true,
      data: {
        rowCount: result.rowCount,
        colCount: result.colCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/upload.html');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('PivotHead CSV Parser - File Upload Server');
  console.log('='.repeat(60));
  console.log(`Server:        http://localhost:${PORT}`);
  console.log(`Upload UI:     http://localhost:${PORT}/upload.html`);
  console.log(`API Docs:      http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('Features:');
  console.log('  ✓ Upload CSV files up to 2GB');
  console.log('  ✓ Streaming processing for large files');
  console.log('  ✓ Real-time progress tracking');
  console.log('  ✓ Chunked parsing (10,000 rows per chunk)');
  console.log('');
  console.log('Test with:');
  console.log(
    `  curl -F "file=@yourfile.csv" http://localhost:${PORT}/api/upload`
  );
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(60));
});

// Cleanup
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  wasm.unload();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  wasm.unload();
  process.exit(0);
});
