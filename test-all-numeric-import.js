import { ConnectService } from '../src/engine/connectService.js';

// Test all-numeric CSV handling
const csvText = `2004,2005,2006
6706,6976,7228
6761,6889,7041
3335,3363,3503`;

// Create a mock file
const mockFile = new File([csvText], 'test-numeric.csv', { type: 'text/csv' });

// Mock engine for testing
const mockEngine = {
  setAutoAllColumn: () => {},
  updateDataSource: data => {
    console.log('✅ Engine received data:', data.length, 'records');
    console.log('📊 Sample record:', data[0]);
  },
  setLayout: (rows, columns, measures) => {
    console.log('🎯 Layout configured:');
    console.log('   Rows:', rows);
    console.log('   Columns:', columns);
    console.log('   Measures:', measures);
  },
};

console.log('🧪 Testing all-numeric CSV import...');

try {
  // Test the processCSVFile method directly
  const result = await ConnectService.processCSVFile(mockFile, mockEngine, {});

  if (result.success) {
    console.log('✅ Import successful!');
    console.log('📈 Result:', {
      fileName: result.fileName,
      recordCount: result.recordCount,
      columns: result.columns,
    });
  } else {
    console.log('❌ Import failed:', result.error);
  }
} catch (error) {
  console.log('❌ Test error:', error.message);
}
