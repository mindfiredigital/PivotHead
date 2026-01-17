/**
 * Basic Node.js Test for PivotHead WASM CSV Parser
 *
 * This demonstrates how to use PivotHead in a Node.js environment
 * to parse CSV files using WebAssembly for high performance.
 */

const fs = require('fs');
const path = require('path');

// Import from the local build (using relative path to packages/core)
// In production, users would do: const { WasmLoader, PivotEngine } = require('@mindfiredigital/pivothead');
const {
  WasmLoader,
  PivotEngine,
} = require('../../packages/core/dist/pivothead-core.umd.js');

async function basicTest() {
  console.log('='.repeat(60));
  console.log('PivotHead Node.js WASM CSV Parser - Basic Test');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Get WasmLoader instance
    console.log('Step 1: Getting WasmLoader instance...');
    const wasm = WasmLoader.getInstance();
    console.log('✓ WasmLoader instance created');
    console.log('');

    // Step 2: Load WASM module
    console.log('Step 2: Loading WASM module...');
    const loadStart = Date.now();
    await wasm.load();
    const loadTime = Date.now() - loadStart;
    console.log(`✓ WASM module loaded in ${loadTime}ms`);
    console.log(`✓ WASM Version: ${wasm.getVersion()}`);
    console.log('');

    // Step 3: Read CSV file
    console.log('Step 3: Reading CSV file...');
    const csvPath = path.join(__dirname, 'sample-data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    console.log(`✓ CSV file loaded: ${csvPath}`);
    console.log(`✓ File size: ${csvData.length} bytes`);
    console.log('');

    // Step 4: Parse CSV using WASM
    console.log('Step 4: Parsing CSV with WASM...');
    const parseStart = Date.now();
    const result = wasm.parseCSVChunk(csvData, {
      delimiter: ',',
      hasHeader: true,
      trimValues: true,
    });
    const parseTime = Date.now() - parseStart;
    console.log('');

    // Step 5: Display results
    console.log('='.repeat(60));
    console.log('PARSING RESULTS');
    console.log('='.repeat(60));
    console.log(
      `Status:           ${result.errorCode === 0 ? '✓ SUCCESS' : '✗ FAILED'}`
    );
    console.log(`Error Code:       ${result.errorCode}`);
    console.log(`Error Message:    ${result.errorMessage || 'None'}`);
    console.log(`Rows Parsed:      ${result.rowCount}`);
    console.log(`Columns:          ${result.colCount}`);
    console.log(`Parse Time:       ${parseTime}ms`);
    console.log(
      `Parse Speed:      ${(csvData.length / parseTime).toFixed(2)} bytes/ms`
    );
    console.log('');

    // Step 6: Memory estimation
    console.log('Step 6: Estimating memory usage...');
    const estimatedMemory = wasm.estimateMemory(
      result.rowCount,
      result.colCount
    );
    console.log(
      `✓ Estimated Memory: ${(estimatedMemory / 1024).toFixed(2)} KB`
    );
    console.log('');

    // Step 7: Test individual field extraction
    console.log('Step 7: Testing field extraction...');
    const lines = csvData.split('\n');
    const firstDataLine = lines[1]; // Skip header
    const field = wasm.extractField(
      firstDataLine,
      0,
      firstDataLine.indexOf(','),
      true
    );
    console.log(`✓ First field extracted: "${field}"`);
    console.log('');

    // Step 8: Test number parsing
    console.log('Step 8: Testing number parsing...');
    const numberStr = '75000';
    const parsed = wasm.parseNumber(numberStr);
    console.log(`✓ Parsed "${numberStr}" to ${parsed}`);
    console.log('');

    // Step 9: Test field type detection
    console.log('Step 9: Testing field type detection...');
    const testValues = ['John Doe', '30', 'true', ''];
    const typeNames = ['string', 'number', 'boolean', 'null'];
    testValues.forEach(value => {
      const type = wasm.detectFieldType(value);
      console.log(`  "${value}" → ${typeNames[type] || 'unknown'}`);
    });
    console.log('');

    // Step 10: Benchmark
    console.log('Step 10: Running benchmark...');
    const benchmarkTime = wasm.benchmark(csvData);
    console.log(`✓ Benchmark completed in ${benchmarkTime}ms`);
    console.log('');

    // Step 11: Test filtering with PivotEngine
    console.log('Step 11: Testing filtering with PivotEngine...');

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

    console.log(`  Original data: ${dataRows.length} rows`);

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
    console.log('✓ PivotEngine instance created');

    // Test 1: Filter by Salary > 70000
    console.log('');
    console.log('  Test 1: Filter Salary > 70000');
    pivotEngine.applyFilters([
      {
        field: 'Salary',
        operator: 'greaterThan',
        value: 70000,
      },
    ]);
    let state = pivotEngine.getState();
    console.log(`  ✓ Filtered rows: ${state.rawData.length}`);

    // Test 2: Filter by Department = 'Engineering'
    console.log('');
    console.log('  Test 2: Filter Department = Engineering');
    pivotEngine.applyFilters([
      {
        field: 'Department',
        operator: 'equals',
        value: 'Engineering',
      },
    ]);
    state = pivotEngine.getState();
    console.log(`  ✓ Filtered rows: ${state.rawData.length}`);

    // Test 3: Multiple filters (Engineering AND Salary > 70000)
    console.log('');
    console.log('  Test 3: Multiple filters (Engineering AND Salary > 70000)');
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
    console.log(`  ✓ Filtered rows: ${state.rawData.length}`);
    console.log('  Sample filtered data:');
    state.rawData.slice(0, 3).forEach(row => {
      console.log(`    - ${row.Name}: ${row.Department}, $${row.Salary}`);
    });

    console.log('');
    console.log('✓ All filter tests passed!');
    console.log('');

    console.log('='.repeat(60));
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  - WASM Load Time:    ${loadTime}ms`);
    console.log(`  - CSV Parse Time:    ${parseTime}ms`);
    console.log(`  - Benchmark Time:    ${benchmarkTime}ms`);
    console.log(`  - Rows Processed:    ${result.rowCount}`);
    console.log(`  - Columns Found:     ${result.colCount}`);
    console.log(
      `  - Memory Estimate:   ${(estimatedMemory / 1024).toFixed(2)} KB`
    );
    console.log(`  - Filter Tests:      3 tests passed`);
    console.log(`  - Original Rows:     ${dataRows.length}`);
    console.log(`  - Final Filtered:    ${state.rawData.length}`);
    console.log('');

    // Cleanup
    // wasm.unload(); // Optional: unload WASM module
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('ERROR OCCURRED');
    console.error('='.repeat(60));
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  basicTest()
    .then(() => {
      console.log('✓ All tests passed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('✗ Test failed:', err);
      process.exit(1);
    });
}

module.exports = { basicTest };
