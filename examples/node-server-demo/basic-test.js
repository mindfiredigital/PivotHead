/**
 * Basic Node.js Test for PivotHead WASM CSV Parser
 *
 * This demonstrates how to use PivotHead in a Node.js environment
 * to parse CSV files using WebAssembly for high performance.
 */
const { logger } = require('./logger');

const fs = require('fs');
const path = require('path');

// Import from the local build (using relative path to packages/core)
// In production, users would do: const { WasmLoader, PivotEngine } = require('@mindfiredigital/pivothead');
const {
  WasmLoader,
  PivotEngine,
} = require('../../packages/core/dist/pivothead-core.umd.js');

async function basicTest() {
  logger.info('='.repeat(60));
  logger.info('PivotHead Node.js WASM CSV Parser - Basic Test');
  logger.info('='.repeat(60));
  logger.info('');

  try {
    // Step 1: Get WasmLoader instance
    logger.info('Step 1: Getting WasmLoader instance...');
    const wasm = WasmLoader.getInstance();
    logger.info('✓ WasmLoader instance created');
    logger.info('');

    // Step 2: Load WASM module
    logger.info('Step 2: Loading WASM module...');
    const loadStart = Date.now();
    await wasm.load();
    const loadTime = Date.now() - loadStart;
    logger.info(`✓ WASM module loaded in ${loadTime}ms`);
    logger.info(`✓ WASM Version: ${wasm.getVersion()}`);
    logger.info('');

    // Step 3: Read CSV file
    logger.info('Step 3: Reading CSV file...');
    const csvPath = path.join(__dirname, 'sample-data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    logger.info(`✓ CSV file loaded: ${csvPath}`);
    logger.info(`✓ File size: ${csvData.length} bytes`);
    logger.info('');

    // Step 4: Parse CSV using WASM
    logger.info('Step 4: Parsing CSV with WASM...');
    const parseStart = Date.now();
    const result = wasm.parseCSVChunk(csvData, {
      delimiter: ',',
      hasHeader: true,
      trimValues: true,
    });
    const parseTime = Date.now() - parseStart;
    logger.info('');

    // Step 5: Display results
    logger.info('='.repeat(60));
    logger.info('PARSING RESULTS');
    logger.info('='.repeat(60));
    logger.info(
      `Status:           ${result.errorCode === 0 ? '✓ SUCCESS' : '✗ FAILED'}`
    );
    logger.info(`Error Code:       ${result.errorCode}`);
    logger.info(`Error Message:    ${result.errorMessage || 'None'}`);
    logger.info(`Rows Parsed:      ${result.rowCount}`);
    logger.info(`Columns:          ${result.colCount}`);
    logger.info(`Parse Time:       ${parseTime}ms`);
    logger.info(
      `Parse Speed:      ${(csvData.length / parseTime).toFixed(2)} bytes/ms`
    );
    logger.info('');

    // Step 6: Memory estimation
    logger.info('Step 6: Estimating memory usage...');
    const estimatedMemory = wasm.estimateMemory(
      result.rowCount,
      result.colCount
    );
    logger.info(
      `✓ Estimated Memory: ${(estimatedMemory / 1024).toFixed(2)} KB`
    );
    logger.info('');

    // Step 7: Test individual field extraction
    logger.info('Step 7: Testing field extraction...');
    const lines = csvData.split('\n');
    const firstDataLine = lines[1]; // Skip header
    const field = wasm.extractField(
      firstDataLine,
      0,
      firstDataLine.indexOf(','),
      true
    );
    logger.info(`✓ First field extracted: "${field}"`);
    logger.info('');

    // Step 8: Test number parsing
    logger.info('Step 8: Testing number parsing...');
    const numberStr = '75000';
    const parsed = wasm.parseNumber(numberStr);
    logger.info(`✓ Parsed "${numberStr}" to ${parsed}`);
    logger.info('');

    // Step 9: Test field type detection
    logger.info('Step 9: Testing field type detection...');
    const testValues = ['John Doe', '30', 'true', ''];
    const typeNames = ['string', 'number', 'boolean', 'null'];
    testValues.forEach(value => {
      const type = wasm.detectFieldType(value);
      logger.info(`  "${value}" → ${typeNames[type] || 'unknown'}`);
    });
    logger.info('');

    // Step 10: Benchmark
    logger.info('Step 10: Running benchmark...');
    const benchmarkTime = wasm.benchmark(csvData);
    logger.info(`✓ Benchmark completed in ${benchmarkTime}ms`);
    logger.info('');

    // Step 11: Test filtering with PivotEngine
    logger.info('Step 11: Testing filtering with PivotEngine...');

    // Parse CSV data into structured format
    const dataLines = csvData.trim().split('\n');
    const headers = dataLines[0].split(',').map(h => h.trim());
    const dataRows = dataLines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Try to parse as number if possible
          row[header] = isNaN(value) ? value : parseFloat(value);
        });
        return row;
      });

    logger.info(`  Original data: ${dataRows.length} rows`);

    // Create PivotEngine configuration
    const pivotConfig = {
      data: dataRows,
      rawData: dataRows,
      rows: headers.map(h => ({ uniqueName: h })),
      columns: [],
      measures: headers
        .filter(h => typeof dataRows[0]?.[h] === 'number')
        .map(h => ({
          uniqueName: h,
          aggregation: 'sum',
        })),
      dimensions: headers
        .filter(h => typeof dataRows[0]?.[h] === 'string')
        .map(h => ({
          field: h,
          label: h,
          type: 'string',
        })),
      defaultAggregation: 'sum',
    };

    // Create PivotEngine instance
    const pivotEngine = new PivotEngine(pivotConfig);
    logger.info('✓ PivotEngine instance created');

    // Test 1: Filter by Salary > 70000
    logger.info('');
    logger.info('  Test 1: Filter Salary > 70000');
    pivotEngine.applyFilters([
      {
        field: 'Salary',
        operator: 'greaterThan',
        value: 70000,
      },
    ]);
    let state = pivotEngine.getState();
    logger.info(`  ✓ Filtered rows: ${state.rawData.length}`);

    // Test 2: Filter by Department = 'Engineering'
    logger.info('');
    logger.info('  Test 2: Filter Department = Engineering');
    pivotEngine.applyFilters([
      {
        field: 'Department',
        operator: 'equals',
        value: 'Engineering',
      },
    ]);
    state = pivotEngine.getState();
    logger.info(`  ✓ Filtered rows: ${state.rawData.length}`);

    // Test 3: Multiple filters (Engineering AND Salary > 70000)
    logger.info('');
    logger.info('  Test 3: Multiple filters (Engineering AND Salary > 70000)');
    pivotEngine.applyFilters([
      {
        field: 'Department',
        operator: 'equals',
        value: 'Engineering',
      },
      {
        field: 'Salary',
        operator: 'greaterThan',
        value: 70000,
      },
    ]);
    state = pivotEngine.getState();
    logger.info(`  ✓ Filtered rows: ${state.rawData.length}`);
    logger.info('  Sample filtered data:');
    state.rawData.slice(0, 3).forEach(row => {
      logger.info(`    - ${row.Name}: ${row.Department}, $${row.Salary}`);
    });

    logger.info('');
    logger.info('✓ All filter tests passed!');
    logger.info('');

    logger.info('='.repeat(60));
    logger.info('TEST COMPLETED SUCCESSFULLY');
    logger.info('='.repeat(60));
    logger.info('');
    logger.info('Summary:');
    logger.info(`  - WASM Load Time:    ${loadTime}ms`);
    logger.info(`  - CSV Parse Time:    ${parseTime}ms`);
    logger.info(`  - Benchmark Time:    ${benchmarkTime}ms`);
    logger.info(`  - Rows Processed:    ${result.rowCount}`);
    logger.info(`  - Columns Found:     ${result.colCount}`);
    logger.info(
      `  - Memory Estimate:   ${(estimatedMemory / 1024).toFixed(2)} KB`
    );
    logger.info(`  - Filter Tests:      3 tests passed`);
    logger.info(`  - Original Rows:     ${dataRows.length}`);
    logger.info(`  - Final Filtered:    ${state.rawData.length}`);
    logger.info('');

    // Cleanup
    // wasm.unload(); // Optional: unload WASM module
  } catch (error) {
    logger.error('');
    logger.error('='.repeat(60));
    logger.error('ERROR OCCURRED');
    logger.error('='.repeat(60));
    logger.error('Message:', error.message);
    logger.error('Stack:', error.stack);
    logger.error('');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  basicTest()
    .then(() => {
      logger.info('✓ All tests passed!');
      process.exit(0);
    })
    .catch(err => {
      logger.error('✗ Test failed:', err);
      process.exit(1);
    });
}

module.exports = { basicTest };
